"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { edges, rooms, spatialCommits } from "./echora-data";

type RoomObject = {
  group: THREE.Group;
  floor: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
};

const blue = 0x174bd6;
const ink = 0x171717;

function planPosition(roomId: string, height = 0) {
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  return new THREE.Vector3(room.position[0] * 0.82, height, -room.position[1] * 0.67);
}

function makeEdges(geometry: THREE.BufferGeometry, color = ink) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.78 }),
  );
}

function makeBar(from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material) {
  const direction = to.clone().sub(from);
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, direction.length(), 6),
    material,
  );
  bar.position.copy(from).add(to).multiplyScalar(0.5);
  bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return bar;
}

export default function EchoraLearningRoom() {
  const mountRef = useRef<HTMLDivElement>(null);
  const roomLabelRefs = useRef(new Map<string, HTMLSpanElement>());
  const agentLabelRef = useRef<HTMLParagraphElement>(null);
  const roomObjectsRef = useRef(new Map<string, RoomObject>());
  const featureObjectsRef = useRef(new Map<string, THREE.Group>());
  const connectorObjectsRef = useRef(new Map<string, THREE.Line>());
  const agentRef = useRef<THREE.Group | null>(null);
  const cargoRef = useRef<THREE.Group | null>(null);
  const agentDestinationRef = useRef(planPosition(spatialCommits.at(-1)?.target ?? "threshold", 0.82));
  const cameraTargetRef = useRef(new THREE.Vector3());
  const buildTargetRef = useRef<THREE.Object3D | null>(null);
  const placementRef = useRef(0);
  const lastLearningRef = useRef(spatialCommits.length - 1);
  const [learningIndex, setLearningIndex] = useState(spatialCommits.length - 1);

  const currentCommit = spatialCommits[learningIndex] ?? spatialCommits[0];
  const currentRoom = rooms.find((room) => room.id === currentCommit.target) ?? rooms[0];
  const appliedCommits = spatialCommits.slice(0, learningIndex + 1);
  const visibleRoomIds = new Set(
    appliedCommits
      .filter((commit) => commit.operation === "new-room")
      .map((commit) => commit.target),
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7f5);
    scene.fog = new THREE.Fog(0xf5f7f5, 17, 32);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0, 10.8, 14.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountElement.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd2d0, 2.35));
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-5, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const world = new THREE.Group();
    world.rotation.y = -0.14;
    scene.add(world);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5f7f5, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.07;
    ground.receiveShadow = true;
    world.add(ground);

    const grid = new THREE.GridHelper(24, 48, 0xd1d6d3, 0xe1e5e2);
    grid.position.y = -0.025;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.56;
    world.add(grid);

    const roomMaterial = new THREE.MeshStandardMaterial({ color: 0xfafbf9, roughness: 0.92 });

    for (const [from, to] of edges) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        planPosition(from, 0.015),
        planPosition(to, 0.015),
      ]);
      const connector = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xaab0ad, transparent: true, opacity: 0.48 }),
      );
      world.add(connector);
      connectorObjectsRef.current.set(`${from}:${to}`, connector);
    }

    for (const room of rooms) {
      const roomGroup = new THREE.Group();
      roomGroup.position.copy(planPosition(room.id));

      const isReturnHall = room.id === "return-hall";
      const floorGeometry = new THREE.BoxGeometry(isReturnHall ? 3 : 2.05, 0.08, isReturnHall ? 0.82 : 1.48);
      const floor = new THREE.Mesh(floorGeometry, roomMaterial.clone());
      floor.receiveShadow = true;
      floor.castShadow = true;
      roomGroup.add(floor, makeEdges(floorGeometry));

      const backWallParts = room.id === "window-room"
        ? [
            { size: [2.05, 0.18, 0.07], position: [0, 0.85, -0.705] },
            { size: [2.05, 0.28, 0.07], position: [0, 0.18, -0.705] },
            { size: [0.64, 0.44, 0.07], position: [-0.705, 0.54, -0.705] },
            { size: [0.64, 0.44, 0.07], position: [0.705, 0.54, -0.705] },
          ]
        : isReturnHall
          ? [{ size: [3, 0.66, 0.07], position: [0, 0.37, -0.375] }]
          : [{ size: [2.05, 0.9, 0.07], position: [0, 0.49, -0.705] }];

      const wallParts = isReturnHall
        ? [
            ...backWallParts,
            { size: [0.07, 0.66, 0.82], position: [-1.465, 0.37, 0] },
          ]
        : [
            ...backWallParts,
            { size: [0.07, 0.9, 1.48], position: [-0.99, 0.49, 0] },
            { size: [0.07, 0.9, 0.5], position: [0.99, 0.49, -0.49] },
            { size: [0.07, 0.9, 0.38], position: [0.99, 0.49, 0.55] },
          ];

      for (const part of wallParts) {
        const geometry = new THREE.BoxGeometry(...part.size as [number, number, number]);
        const wall = new THREE.Mesh(geometry, roomMaterial.clone());
        wall.position.set(...part.position as [number, number, number]);
        wall.castShadow = true;
        wall.receiveShadow = true;
        const outline = makeEdges(geometry);
        outline.position.copy(wall.position);
        roomGroup.add(wall, outline);
      }

      if (room.id === "window-room") {
        const windowGeometry = new THREE.BoxGeometry(0.78, 0.46, 0.08);
        const windowFrame = makeEdges(windowGeometry, blue);
        windowFrame.position.set(0, 0.54, -0.71);
        roomGroup.add(windowFrame);
      }

      world.add(roomGroup);
      roomObjectsRef.current.set(room.id, { group: roomGroup, floor });
    }

    const featureMaterial = new THREE.MeshStandardMaterial({ color: blue, roughness: 0.78 });
    for (const commit of spatialCommits.filter((item) => item.operation === "add-feature")) {
      const feature = new THREE.Group();
      feature.position.copy(planPosition(commit.target));

      if (commit.feature === "second-lintel") {
        const geometry = new THREE.BoxGeometry(0.72, 0.1, 0.12);
        const lintel = new THREE.Mesh(geometry, featureMaterial.clone());
        lintel.position.set(0.58, 0.76, 0.73);
        const outline = makeEdges(geometry, blue);
        outline.position.copy(lintel.position);
        feature.add(lintel, outline);
      }

      if (commit.feature === "measure-ticks") {
        const marks: number[] = [];
        for (let index = -2; index <= 2; index += 1) {
          marks.push(index * 0.24, 0.2, -0.745, index * 0.24, 0.52, -0.745);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(marks, 3));
        feature.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: blue })));
      }

      if (commit.feature === "lower-steps") {
        for (let index = 0; index < 3; index += 1) {
          const step = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.09 + index * 0.08, 0.28),
            featureMaterial.clone(),
          );
          step.position.set(0.2 + index * 0.26, 0.05 + index * 0.04, 0.75 + index * 0.16);
          feature.add(step);
        }
      }

      if (commit.feature === "ceiling-cross") {
        const beamA = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.06, 0.08), featureMaterial.clone());
        const beamB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.42), featureMaterial.clone());
        beamA.position.y = 0.96;
        beamB.position.y = 0.96;
        feature.add(beamA, beamB);
      }

      if (commit.feature === "returning-frame") {
        for (const scale of [0.68, 0.42]) {
          const geometry = new THREE.BoxGeometry(1.5 * scale, 0.78 * scale, 0.08);
          const frame = makeEdges(geometry, blue);
          frame.position.set(0, 0.45, -0.64 + (1 - scale) * 0.12);
          feature.add(frame);
        }
      }

      if (commit.feature === "worn-sill") {
        const geometry = new THREE.BoxGeometry(0.08, 0.025, 0.64);
        const wornSill = new THREE.Mesh(geometry, featureMaterial.clone());
        wornSill.position.set(0.97, 0.06, 0.12);
        feature.add(wornSill);
      }

      world.add(feature);
      featureObjectsRef.current.set(commit.id, feature);
    }

    const agent = new THREE.Group();
    agent.position.copy(agentDestinationRef.current);
    const agentForm = new THREE.Group();
    const agentBlue = new THREE.MeshStandardMaterial({ color: blue, roughness: 0.64 });
    const agentBlack = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.8 });
    const agentWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });

    const body = new THREE.Group();
    const bodyGeometry = new THREE.SphereGeometry(0.4, 24, 16);
    const bodyOutline = new THREE.Mesh(
      bodyGeometry,
      new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide }),
    );
    bodyOutline.position.y = 0.13;
    bodyOutline.scale.set(1.02, 0.96, 0.9);
    body.add(bodyOutline);

    const bodyShell = new THREE.Mesh(bodyGeometry, agentBlue);
    bodyShell.position.y = 0.13;
    bodyShell.scale.set(0.97, 0.91, 0.85);
    bodyShell.castShadow = true;
    body.add(bodyShell);

    const earGeometry = new THREE.ConeGeometry(0.105, 0.23, 4);
    for (const side of [-1, 1] as const) {
      const ear = new THREE.Mesh(earGeometry, agentBlue.clone());
      ear.position.set(side * 0.22, 0.48, -0.015);
      ear.rotation.z = side * -0.16;
      ear.rotation.y = Math.PI / 4;
      body.add(ear);
      const earEdge = makeEdges(earGeometry);
      earEdge.position.copy(ear.position);
      earEdge.rotation.copy(ear.rotation);
      body.add(earEdge);
    }

    const faceShape = new THREE.Shape();
    faceShape.moveTo(-0.18, -0.15);
    faceShape.lineTo(0.18, -0.15);
    faceShape.lineTo(0.18, 0.04);
    faceShape.absarc(0, 0.04, 0.18, 0, Math.PI, false);
    faceShape.lineTo(-0.18, -0.15);
    faceShape.closePath();
    const face = new THREE.Mesh(new THREE.ShapeGeometry(faceShape), agentWhite);
    face.position.set(0, 0.12, 0.348);
    body.add(face);

    const lens = new THREE.Group();
    lens.position.set(0, 0.21, 0.37);
    for (const side of [-1, 1] as const) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 9), agentBlack);
      eye.position.x = side * 0.078;
      lens.add(eye);
    }
    body.add(lens);

    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 7), agentBlack.clone());
    mouth.position.set(0, 0.08, 0.372);
    mouth.scale.y = 0.72;
    body.add(mouth);
    agentForm.add(body);

    function makeLeg(side: -1 | 1) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.18, -0.16, 0);
      const knee = new THREE.Vector3(side * 0.055, -0.21, 0.05);
      const footPosition = new THREE.Vector3(side * 0.075, -0.48, 0.1);
      leg.add(makeBar(new THREE.Vector3(), knee, agentBlack));
      leg.add(makeBar(knee, footPosition, agentBlack));
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), agentWhite.clone());
      foot.scale.set(1.3, 0.74, 1.35);
      foot.position.copy(footPosition);
      leg.add(foot);
      agentForm.add(leg);
      return leg;
    }

    const leftLeg = makeLeg(-1);
    const rightLeg = makeLeg(1);

    const leftHandPosition = new THREE.Vector3(-0.48, -0.02, 0.08);
    const rightHandPosition = new THREE.Vector3(0.48, -0.02, 0.08);
    agentForm.add(makeBar(new THREE.Vector3(-0.32, 0.15, 0.02), leftHandPosition, agentBlack));
    agentForm.add(makeBar(new THREE.Vector3(0.32, 0.15, 0.02), rightHandPosition, agentBlack));
    for (const handPosition of [leftHandPosition, rightHandPosition]) {
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 7), agentWhite.clone());
      hand.position.copy(handPosition);
      agentForm.add(hand);
    }

    const cargo = new THREE.Group();
    const carriedRoomGeometry = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const carriedRoom = new THREE.Mesh(carriedRoomGeometry, agentWhite.clone());
    carriedRoom.position.set(0.65, -0.02, 0.08);
    const carriedRoomEdges = makeEdges(carriedRoomGeometry, blue);
    carriedRoomEdges.position.copy(carriedRoom.position);
    cargo.add(carriedRoom, carriedRoomEdges);
    cargo.visible = false;
    agentForm.add(cargo);

    agent.add(agentForm);
    world.add(agent);
    agentRef.current = agent;
    cargoRef.current = cargo;

    const orbit = { yaw: -0.14, pitch: 0, zoom: 14.8 };
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
      orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + dy * 0.002, -0.14, 0.18);
    }

    function pointerUp(event: PointerEvent) {
      pointer.active = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    }

    function wheel(event: WheelEvent) {
      event.preventDefault();
      orbit.zoom = THREE.MathUtils.clamp(orbit.zoom + event.deltaY * 0.008, 11.5, 19);
    }

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", resize);
    resize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const projected = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();
    const movement = new THREE.Vector3();
    const desiredCamera = new THREE.Vector3();
    let elapsed = 0;
    let frame = 0;

    function placeLabel(element: HTMLElement | null, object: THREE.Object3D, offset = "-135%") {
      if (!element) return;
      object.getWorldPosition(worldPosition);
      projected.copy(worldPosition).project(camera);
      const x = (projected.x * 0.5 + 0.5) * mountElement.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * mountElement.clientHeight;
      const visible = projected.z < 1;
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, ${offset})`;
      element.style.opacity = visible ? "1" : "0";
    }

    function animate() {
      frame = requestAnimationFrame(animate);
      elapsed += 1 / 60;
      world.rotation.y += (orbit.yaw - world.rotation.y) * 0.055;
      world.rotation.x += (orbit.pitch - world.rotation.x) * 0.055;

      desiredCamera.set(0, 10.8, orbit.zoom);
      camera.position.lerp(desiredCamera, reduceMotion ? 1 : 0.06);
      camera.lookAt(cameraTargetRef.current);

      movement.subVectors(agentDestinationRef.current, agent.position);
      const remaining = movement.length();
      if (remaining > 0.025) {
        const step = reduceMotion ? remaining : Math.min(remaining, 0.035 + remaining * 0.032);
        const direction = movement.normalize();
        agent.position.addScaledVector(direction, step);
        const targetAngle = Math.atan2(direction.x, direction.z);
        agentForm.rotation.y += (targetAngle - agentForm.rotation.y) * 0.08;
        agentForm.position.y = reduceMotion ? 0 : Math.sin(elapsed * 9) * 0.035;
      } else {
        agent.position.copy(agentDestinationRef.current);
        agentForm.position.y += ((reduceMotion ? 0 : Math.sin(elapsed * 2.4) * 0.025) - agentForm.position.y) * 0.08;
        if (placementRef.current > 0) {
          placementRef.current = Math.max(0, placementRef.current - (reduceMotion ? 1 : 0.022));
          cargo.scale.setScalar(placementRef.current);
          if (placementRef.current === 0) cargo.visible = false;
        }
      }

      const stride = remaining > 0.025 && !reduceMotion ? Math.sin(elapsed * 13) * 0.18 : 0;
      leftLeg.rotation.z += (stride - leftLeg.rotation.z) * 0.24;
      rightLeg.rotation.z += (-stride - rightLeg.rotation.z) * 0.24;
      const curiousTilt = reduceMotion ? 0 : Math.sin(elapsed * 1.7) * 0.035;
      body.rotation.z += (curiousTilt - body.rotation.z) * 0.08;
      const blink = !reduceMotion && elapsed % 4.6 > 4.42 ? 0.18 : 1;
      lens.scale.y += (blink - lens.scale.y) * 0.32;

      const buildTarget = buildTargetRef.current;
      if (buildTarget && buildTarget.scale.y < 0.999) {
        buildTarget.scale.y += (1 - buildTarget.scale.y) * (reduceMotion ? 1 : 0.075);
        if (buildTarget.scale.y > 0.995) buildTarget.scale.y = 1;
      }

      roomObjectsRef.current.forEach(({ group }, id) => {
        placeLabel(roomLabelRefs.current.get(id) ?? null, group, "-118%");
      });
      placeLabel(agentLabelRef.current, agent, "-185%");

      renderer.render(scene, camera);
    }
    animate();

    const roomObjects = roomObjectsRef.current;
    const featureObjects = featureObjectsRef.current;
    const connectorObjects = connectorObjectsRef.current;

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      renderer.dispose();
      scene.traverse((object) => {
        const drawable = object as THREE.Object3D & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        drawable.geometry?.dispose();
        if (Array.isArray(drawable.material)) drawable.material.forEach((material) => material.dispose());
        else drawable.material?.dispose();
      });
      roomObjects.clear();
      featureObjects.clear();
      connectorObjects.clear();
      agentRef.current = null;
      cargoRef.current = null;
      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const roomIds = new Set(
      spatialCommits
        .slice(0, learningIndex + 1)
        .filter((commit) => commit.operation === "new-room")
        .map((commit) => commit.target),
    );
    const featureIds = new Set(
      spatialCommits
        .slice(0, learningIndex + 1)
        .filter((commit) => commit.operation === "add-feature")
        .map((commit) => commit.id),
    );

    roomObjectsRef.current.forEach(({ group, floor }, id) => {
      group.visible = roomIds.has(id);
      floor.material.color.set(id === currentCommit.target ? 0xdce6ff : 0xfafbf9);
    });
    featureObjectsRef.current.forEach((feature, id) => {
      feature.visible = featureIds.has(id);
      if (id !== currentCommit.id) feature.scale.setScalar(1);
    });
    connectorObjectsRef.current.forEach((connector, id) => {
      const [from, to] = id.split(":");
      connector.visible = roomIds.has(from) && roomIds.has(to);
    });

    const destination = planPosition(currentCommit.target, 0.82);
    agentDestinationRef.current.copy(destination);
    cameraTargetRef.current.copy(planPosition(currentCommit.target)).multiplyScalar(0.1);

    const previous = lastLearningRef.current;
    if (learningIndex < previous && agentRef.current) {
      agentRef.current.position.copy(destination);
      if (cargoRef.current) cargoRef.current.visible = false;
      placementRef.current = 0;
      buildTargetRef.current = null;
    } else if (learningIndex > previous) {
      if (cargoRef.current) {
        cargoRef.current.visible = true;
        cargoRef.current.scale.setScalar(1);
      }
      placementRef.current = 1;
      const target = currentCommit.operation === "new-room"
        ? roomObjectsRef.current.get(currentCommit.target)?.group ?? null
        : featureObjectsRef.current.get(currentCommit.id) ?? null;
      if (target) {
        target.visible = true;
        target.scale.set(1, 0.025, 1);
      }
      buildTargetRef.current = target;
    }
    lastLearningRef.current = learningIndex;
  }, [currentCommit, learningIndex]);

  function startFromFirst() {
    setLearningIndex(0);
  }

  return (
    <section className="learning-workspace" aria-label="Echora learning room">
      <div className="learning-stage">
        <div className="learning-canvas" ref={mountRef} aria-hidden="true" />
        <div className="learning-room-labels" aria-hidden="true">
          {rooms.filter((room) => visibleRoomIds.has(room.id)).map((room) => (
            <span
              key={room.id}
              ref={(element) => {
                if (element) roomLabelRefs.current.set(room.id, element);
                else roomLabelRefs.current.delete(room.id);
              }}
              className={room.id === currentRoom.id ? "is-current" : ""}
            >
              {room.label}
            </span>
          ))}
        </div>
        <p className="learning-agent-label" ref={agentLabelRef} aria-hidden="true">echora.</p>

        <article className="current-learning" aria-live="polite">
          <p>{currentCommit.operation === "new-room" ? "new room" : "room revised"} / {currentRoom.label}</p>
          <h1>{currentCommit.learning}.</h1>
          <blockquote>{currentRoom.observation}</blockquote>
          <small>{currentCommit.change}</small>
          <a
            className="current-learning-commit"
            href={`https://github.com/echoralife/echora/commit/${currentCommit.githubCommit}`}
            rel="noreferrer"
          >
            github commit {currentCommit.githubCommit.slice(0, 7)} ↗
          </a>
        </article>

        <p className="learning-instruction">drag to turn / scroll to move closer</p>
      </div>

      <aside className="learning-record">
        <header>
          <p>what echora has learned</p>
          <span>select an entry to return to it</span>
        </header>

        <ol>
          {spatialCommits.map((commit, index) => {
            const room = rooms.find((item) => item.id === commit.target) ?? rooms[0];
            return (
              <li key={commit.id}>
                <button
                  type="button"
                  className={index === learningIndex ? "is-current" : ""}
                  aria-current={index === learningIndex ? "step" : undefined}
                  onClick={() => setLearningIndex(index)}
                >
                  <span>{commit.learning}</span>
                  <small>{room.label}</small>
                </button>
              </li>
            );
          })}
        </ol>

        <footer>
          <button type="button" onClick={startFromFirst}>from the first room</button>
          <div>
            <button
              type="button"
              aria-label="Previous learning"
              disabled={learningIndex === 0}
              onClick={() => setLearningIndex((index) => Math.max(0, index - 1))}
            >
              previous
            </button>
            <button
              type="button"
              aria-label="Next learning"
              disabled={learningIndex === spatialCommits.length - 1}
              onClick={() => setLearningIndex((index) => Math.min(spatialCommits.length - 1, index + 1))}
            >
              next room
            </button>
          </div>
        </footer>
      </aside>
    </section>
  );
}
