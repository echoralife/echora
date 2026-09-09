"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { edges, rooms, spatialCommits } from "./echora-data";

export default function EchoraWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef(new Map<string, HTMLButtonElement>());
  const targetRef = useRef(new THREE.Vector3());
  const cameraDestinationRef = useRef(new THREE.Vector3(0, 0, 16));
  const roomObjectsRef = useRef(new Map<string, { wire: THREE.LineSegments; fill: THREE.Mesh }>());
  const featureObjectsRef = useRef(new Map<string, THREE.Object3D>());
  const edgeObjectsRef = useRef(new Map<string, THREE.LineSegments>());
  const centerRef = useRef<THREE.LineSegments | null>(null);
  const centerLabelRef = useRef<HTMLParagraphElement>(null);
  const [activeId, setActiveId] = useState("threshold");
  const [visited, setVisited] = useState<string[]>(["threshold"]);
  const [commitStep, setCommitStep] = useState(spatialCommits.length);
  const appliedCommits = spatialCommits.slice(0, commitStep);
  const visibleRoomIds = new Set(appliedCommits.filter((commit) => commit.operation === "new-room").map((commit) => commit.target));
  const activeFeatures = appliedCommits.filter((commit) => commit.operation === "add-feature" && commit.target === activeId);
  const latestCommit = appliedCommits.at(-1) ?? spatialCommits[0];
  const activeRoom = rooms.find((room) => room.id === activeId) ?? rooms[0];
  const roomCommit = appliedCommits.find((commit) => commit.operation === "new-room" && commit.target === activeId);

  function enterRoom(id: string) {
    setActiveId(id);
    setVisited((current) => current.at(-1) === id ? current : [...current, id]);
  }

  function returnToThreshold() {
    setActiveId("threshold");
    setVisited(["threshold"]);
  }

  function replayGrowth() {
    setCommitStep(1);
    setActiveId("threshold");
    setVisited(["threshold"]);
  }

  function applyNextCommit() {
    const next = spatialCommits[commitStep];
    if (!next) return;
    setCommitStep((current) => current + 1);
    if (next.operation === "new-room") {
      setActiveId(next.target);
      setVisited((current) => current.at(-1) === next.target ? current : [...current, next.target]);
    }
  }

  useEffect(() => {
    const room = rooms.find((item) => item.id === activeId) ?? rooms[0];
    const position = new THREE.Vector3(...room.position);
    targetRef.current.copy(position).multiplyScalar(0.22);
    cameraDestinationRef.current.copy(position).multiplyScalar(0.34).add(new THREE.Vector3(0, 0.5, 12.5));

    const roomIds = new Set(spatialCommits.slice(0, commitStep).filter((commit) => commit.operation === "new-room").map((commit) => commit.target));
    const featureIds = new Set(spatialCommits.slice(0, commitStep).filter((commit) => commit.operation === "add-feature").map((commit) => commit.id));

    roomObjectsRef.current.forEach(({ wire, fill }, id) => {
      wire.visible = roomIds.has(id);
      fill.visible = roomIds.has(id);
      const selected = id === activeId;
      const seen = visited.includes(id);
      (wire.material as THREE.LineBasicMaterial).color.set(selected ? 0x315b73 : seen ? 0x7d949f : 0xaaa8a2);
      (wire.material as THREE.LineBasicMaterial).opacity = selected ? 1 : seen ? 0.72 : 0.36;
      (fill.material as THREE.MeshBasicMaterial).opacity = selected ? 0.075 : 0;
    });

    featureObjectsRef.current.forEach((object, id) => {
      object.visible = featureIds.has(id);
    });

    edgeObjectsRef.current.forEach((edge, id) => {
      const [from, to] = id.split(":");
      edge.visible = roomIds.has(from) && roomIds.has(to);
    });

    if (centerRef.current) {
      const away = position.lengthSq() === 0
        ? new THREE.Vector3(0, 0, -4)
        : position.clone().normalize().multiplyScalar(-4.4);
      centerRef.current.position.copy(away);
    }
  }, [activeId, visited, commitStep]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdfdfb);
    scene.fog = new THREE.Fog(0xfdfdfb, 18, 34);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountElement.appendChild(renderer.domElement);

    const structure = new THREE.Group();
    structure.rotation.set(-0.08, -0.1, 0.02);
    scene.add(structure);

    const roomById = new Map(rooms.map((room) => [room.id, room]));
    for (const [from, to] of edges) {
      const a = roomById.get(from);
      const b = roomById.get(to);
      if (!a || !b) continue;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute([...a.position, ...b.position], 3));
      const line = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xc9c7c1, transparent: true, opacity: 0.48 }),
      );
      structure.add(line);
      edgeObjectsRef.current.set(`${from}:${to}`, line);
    }

    for (const room of rooms) {
      const width = room.id === "threshold" ? 2.35 : 1.65;
      const height = room.id === "unlit-stair" ? 2.35 : 1.35;
      const depth = room.id === "room-behind" ? 1.45 : 0.85;
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const fill = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: 0x315b73, transparent: true, opacity: 0, depthWrite: false }),
      );
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({
          color: room.id === "threshold" ? 0x315b73 : 0xaaa8a2,
          transparent: true,
          opacity: room.id === "threshold" ? 1 : 0.36,
        }),
      );
      fill.position.set(...room.position);
      wire.position.copy(fill.position);
      fill.rotation.set(0.08 * room.position[1], -0.055 * room.position[0], 0.025 * room.position[2]);
      wire.rotation.copy(fill.rotation);
      structure.add(fill, wire);
      roomObjectsRef.current.set(room.id, { wire, fill });
    }

    const featureMaterial = new THREE.LineBasicMaterial({ color: 0x7d5048, transparent: true, opacity: 0.82 });
    for (const commit of spatialCommits.filter((item) => item.operation === "add-feature")) {
      const room = roomById.get(commit.target);
      if (!room || !commit.feature) continue;
      const feature = new THREE.Group();
      feature.position.set(...room.position);

      if (commit.feature === "second-lintel") {
        const lintel = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(1.45, 0.12, 0.18)),
          featureMaterial.clone(),
        );
        lintel.position.set(0, 0.38, 0.58);
        feature.add(lintel);
      }

      if (commit.feature === "measure-ticks") {
        const points: number[] = [];
        for (let index = -2; index <= 2; index += 1) {
          const y = index * 0.22;
          points.push(-0.82, y, 0.5, -0.55, y, 0.5);
        }
        const ticks = new THREE.BufferGeometry();
        ticks.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        feature.add(new THREE.LineSegments(ticks, featureMaterial.clone()));
      }

      if (commit.feature === "lower-steps") {
        for (let index = 0; index < 3; index += 1) {
          const step = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.86 - index * 0.12, 0.13, 0.42)),
            featureMaterial.clone(),
          );
          step.position.set(0.75 + index * 0.18, -0.55 - index * 0.14, 0.42 + index * 0.18);
          feature.add(step);
        }
      }

      if (commit.feature === "ceiling-cross") {
        const cross = new THREE.BufferGeometry();
        cross.setAttribute("position", new THREE.Float32BufferAttribute([
          -1.05, 0.78, 0, 1.05, 0.78, 0,
          0, 0.78, -0.82, 0, 0.78, 0.82,
        ], 3));
        feature.add(new THREE.LineSegments(cross, featureMaterial.clone()));
      }

      if (commit.feature === "returning-frame") {
        for (const scale of [0.72, 0.48]) {
          const frame = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(1.65 * scale, 1.35 * scale, 0.85 * scale)),
            featureMaterial.clone(),
          );
          frame.position.z = 0.18 * (1 - scale);
          feature.add(frame);
        }
      }

      structure.add(feature);
      featureObjectsRef.current.set(commit.id, feature);
    }

    const missingGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.05, 1.55, 1.1));
    const missingMaterial = new THREE.LineDashedMaterial({
      color: 0x7d5048,
      dashSize: 0.18,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.7,
    });
    const missingRoom = new THREE.LineSegments(missingGeometry, missingMaterial);
    missingRoom.computeLineDistances();
    missingRoom.rotation.set(0.12, 0.26, -0.06);
    missingRoom.position.copy(new THREE.Vector3(...rooms[0].position).normalize().multiplyScalar(-4.4));
    structure.add(missingRoom);
    centerRef.current = missingRoom;

    const orbit = { yaw: -0.1, pitch: -0.08, zoom: 16 };
    const pointer = { active: false, x: 0, y: 0 };

    function resize() {
      const { width, height } = mountElement.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    function pointerDown(event: PointerEvent) {
      pointer.active = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function pointerMove(event: PointerEvent) {
      if (!pointer.active) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      orbit.yaw += dx * 0.004;
      orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + dy * 0.003, -0.58, 0.58);
    }

    function pointerUp(event: PointerEvent) {
      pointer.active = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    }

    function wheel(event: WheelEvent) {
      event.preventDefault();
      orbit.zoom = THREE.MathUtils.clamp(orbit.zoom + event.deltaY * 0.008, 10.5, 23);
    }

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", resize);
    resize();

    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const worldPosition = new THREE.Vector3();
    const projected = new THREE.Vector3();

    function animate() {
      frame = requestAnimationFrame(animate);
      structure.rotation.y += (orbit.yaw - structure.rotation.y) * 0.055;
      structure.rotation.x += (orbit.pitch - structure.rotation.x) * 0.055;
      if (!reduceMotion && !pointer.active) orbit.yaw += 0.00045;

      const desired = cameraDestinationRef.current.clone();
      desired.z = orbit.zoom;
      camera.position.lerp(desired, reduceMotion ? 1 : 0.045);
      camera.lookAt(targetRef.current);

      for (const room of rooms) {
        const object = roomObjectsRef.current.get(room.id)?.wire;
        const label = labelRefs.current.get(room.id);
        if (!object || !label) continue;
        object.getWorldPosition(worldPosition);
        projected.copy(worldPosition).project(camera);
        const visible = object.visible && projected.z < 1;
        const x = (projected.x * 0.5 + 0.5) * mountElement.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * mountElement.clientHeight;
        label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        label.style.opacity = visible ? "1" : "0";
        label.style.pointerEvents = visible ? "auto" : "none";
      }

      const centerLabel = centerLabelRef.current;
      if (centerLabel) {
        missingRoom.getWorldPosition(worldPosition);
        projected.copy(worldPosition).project(camera);
        const x = (projected.x * 0.5 + 0.5) * mountElement.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * mountElement.clientHeight;
        centerLabel.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      renderer.render(scene, camera);
    }
    animate();

    const roomObjects = roomObjectsRef.current;
    const featureObjects = featureObjectsRef.current;
    const edgeObjects = edgeObjectsRef.current;

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      renderer.dispose();
      missingGeometry.dispose();
      missingMaterial.dispose();
      featureMaterial.dispose();
      structure.traverse((object) => {
        const drawable = object as THREE.Object3D & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        drawable.geometry?.dispose();
        if (Array.isArray(drawable.material)) drawable.material.forEach((material) => material.dispose());
        else drawable.material?.dispose();
      });
      roomObjects.clear();
      featureObjects.clear();
      edgeObjects.clear();
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="survey" aria-label="Interactive Echora survey">
      <div className="world-frame" id="threshold">
        <div className="world-canvas" ref={mountRef} aria-hidden="true" />
        <div className="room-labels" aria-label="Rooms">
          {rooms.filter((room) => visibleRoomIds.has(room.id)).map((room) => (
            <button
              key={room.id}
              ref={(element) => {
                if (element) labelRefs.current.set(room.id, element);
                else labelRefs.current.delete(room.id);
              }}
              type="button"
              className={activeId === room.id ? "is-active" : visited.includes(room.id) ? "is-visited" : ""}
              aria-pressed={activeId === room.id}
              onClick={() => enterRoom(room.id)}
            >
              {room.label}
            </button>
          ))}
        </div>
        <p className="center-note" ref={centerLabelRef} aria-hidden="true">no room<br />moves when approached</p>
        <p className="world-instruction">drag / select a room</p>
      </div>

      <aside className="room-reading" aria-live="polite">
        <div className="reading-index">
          <span>current room</span>
          <b>{activeRoom.label}</b>
        </div>
        <blockquote>{activeRoom.observation}</blockquote>
        <dl>
          <div><dt>bearing</dt><dd>{activeRoom.bearing}</dd></div>
          <div><dt>added by</dt><dd>{roomCommit?.id ?? "not yet added"}</dd></div>
        </dl>
        <div className="room-features">
          <span>things added here</span>
          {activeFeatures.length ? (
            <ul>{activeFeatures.map((commit) => <li key={commit.id}>{commit.change}</li>)}</ul>
          ) : (
            <p>nothing added later</p>
          )}
        </div>
        <div className="path-record">
          <span>rooms visited</span>
          <ol>
            {visited.map((id, index) => (
              <li key={`${id}-${index}`}>{rooms.find((room) => room.id === id)?.label}</li>
            ))}
          </ol>
        </div>
        <div className="growth-control">
          <span>last change</span>
          <b>{latestCommit.change}</b>
          <div>
            <button type="button" onClick={replayGrowth}>start over</button>
            <button type="button" onClick={applyNextCommit} disabled={commitStep >= spatialCommits.length}>
              {commitStep >= spatialCommits.length ? "all changes shown" : "next change"}
            </button>
          </div>
        </div>
        <button className="return-button" type="button" onClick={returnToThreshold}>
          go to the threshold
        </button>
      </aside>
    </section>
  );
}
