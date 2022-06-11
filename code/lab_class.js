const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

import "../node_modules/@mediapipe/camera_utils/camera_utils.js";
import "../node_modules/@mediapipe/control_utils/control_utils.js";
import "../node_modules/@mediapipe/drawing_utils/drawing_utils.js";
import "../node_modules/@mediapipe/pose/pose.js";

import * as THREE from "three";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
const render_w = videoElement.videoWidth;
const render_h = videoElement.videoHeight;
renderer.setSize(render_w, render_h);
renderer.setViewport(0, 0, render_w, render_h);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const camera_ar = new THREE.PerspectiveCamera(
  45,
  render_w / render_h,
  0.1,
  1000
);
camera_ar.position.set(-1, 2, 3);
camera_ar.up.set(0, 1, 0);
camera_ar.lookAt(0, 1, 0);

const camera_world = new THREE.PerspectiveCamera(
  45,
  render_w / render_h,
  1,
  1000
);
camera_world.position.set(0, 1, 3);
camera_world.up.set(0, 1, 0);
camera_world.lookAt(0, 1, 0);
camera_world.updateProjectionMatrix();

const controls = new OrbitControls(camera_ar, renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.target.set(0, 1, -1);
controls.update();

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = -5;
dirLight.shadow.camera.left = -5;
dirLight.shadow.camera.right = 5;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;
scene.add(dirLight);

const ground_mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
ground_mesh.rotation.x = -Math.PI / 2;
ground_mesh.receiveShadow = true;
scene.add(ground_mesh);

const grid_helper = new THREE.GridHelper(1000, 1000);
grid_helper.rotation.x = Math.PI / 2;
ground_mesh.add(grid_helper);

let model,
  skeleton = null,
  skeleton_helper,
  mixer,
  numAnimations;
let axis_helpers = [];
const loader = new GLTFLoader();
loader.load("../models/gltf/Xbot.glb", function (gltf) {
  model = gltf.scene;
  scene.add(model);

  let bones = [];
  model.traverse(function (object) {
    if (object.isMesh) object.castShadow = true;

    //console.log(object.isBone);
    if (object.isBone) {
      // https://stackoverflow.com/questions/13309289/three-js-geometry-on-top-of-another
      bones.push(object);
      //console.log(object);
      //if(object.name == "mixamorigLeftToeBase") {
      //let axis_helper = new THREE.AxesHelper(20);
      //axis_helper.material.depthTest = false;
      //object.add(new THREE.AxesHelper(20));
      //}
      //let axis_helper = new THREE.AxesHelper(20);
      //axis_helper.material.depthTest = false;
      //object.add(axis_helper);
      //axis_helpers.push(axis_helper);
    }
  });

  bones.forEach(function (bone) {
    console.log(bone.name);
  });

  skeleton = new THREE.Skeleton(bones);

  skeleton_helper = new THREE.SkeletonHelper(model);
  skeleton_helper.visible = true;

  scene.add(skeleton_helper);

  //const animations = gltf.animations;
  //mixer = new THREE.AnimationMixer( model );

  //numAnimations = animations.length;

  //console.log(model.position);
  //console.log(model.scale);
});

let name_to_index = {
  nose: 0,
  left_eye_inner: 1,
  left_eye: 2,
  left_eye_outer: 3,
  right_eye_inner: 4,
  right_eye: 5,
  right_eye_outer: 6,
  left_ear: 7,
  right_ear: 8,
  mouse_left: 9,
  mouse_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pinky: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 29,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32,
};
let index_to_name = {};
for (const [key, value] of Object.entries(name_to_index)) {
  //console.log(key, value);
  index_to_name[value] = key;
}

let axis_helper_root = new THREE.AxesHelper(1);
axis_helper_root.position.set(0, 0.001, 0);
scene.add(axis_helper_root);

const test_points = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0xff0000,
    size: 0.1,
    sizeAttenuation: true,
  })
);

const test_points_aux = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0x0000ff,
    size: 0.1,
    sizeAttenuation: true,
  })
);
test_points.geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(33 * 3), 3)
);

test_points_aux.geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(10 * 3), 3)
);
scene.add(test_points);
scene.add(test_points_aux);

function computeR(A, B) {
  // get unit vectors
  const uA = A.clone().normalize();
  const uB = B.clone().normalize();

  // get products
  const idot = uA.dot(uB);
  const cross_AB = new THREE.Vector3().crossVectors(uA, uB);
  const cdot = cross_AB.length();

  // get new unit vectors
  const u = uA.clone();
  const v = new THREE.Vector3()
    .subVectors(uB, uA.clone().multiplyScalar(idot))
    .normalize();
  const w = cross_AB.clone().normalize();

  // get change of basis matrix
  const C = new THREE.Matrix4().makeBasis(u, v, w).transpose();

  // get rotation matrix in new basis
  const R_uvw = new THREE.Matrix4().set(
    idot,
    -cdot,
    0,
    0,
    cdot,
    idot,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );

  // full rotation matrix
  //const R = new Matrix4().multiplyMatrices(new Matrix4().multiplyMatrices(C, R_uvw), C.clone().transpose());
  const R = new THREE.Matrix4().multiplyMatrices(
    C.clone().transpose(),
    new THREE.Matrix4().multiplyMatrices(R_uvw, C)
  );
  return R;
}

function onResults2(results) {
  if (!results.poseLandmarks) {
    return;
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  {
    // Only overwrite existing pixels.
    // canvasCtx.globalCompositeOperation = 'source-in';
    // canvasCtx.fillStyle = '#00FF00';
    // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    //console.log(results.poseLandmarks);

    canvasCtx.globalCompositeOperation = "source-over";
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: "#FF0000",
      radius: 1,
    });
    canvasCtx.restore();
  }

  function update3dpose(camera, dist_from_cam, offset, poseLandmarks) {
    // if the camera is orthogonal, set scale to 1
    const ip_lt = new THREE.Vector3(-1, 1, -1).unproject(camera);
    const ip_rb = new THREE.Vector3(1, -1, -1).unproject(camera);
    const ip_diff = new THREE.Vector3().subVectors(ip_rb, ip_lt);
    const x_scale = Math.abs(ip_diff.x);

    function ProjScale(p_ms, cam_pos, src_d, dst_d) {
      let vec_cam2p = new THREE.Vector3().subVectors(p_ms, cam_pos);
      return new THREE.Vector3().addVectors(
        cam_pos,
        vec_cam2p.multiplyScalar(dst_d / src_d)
      );
    }

    let pose3dDict = {};
    for (const [key, value] of Object.entries(poseLandmarks)) {
      let p_3d = new THREE.Vector3(
        (value.x - 0.5) * 2.0,
        -(value.y - 0.5) * 2.0,
        0
      ).unproject(camera);
      p_3d.z = -value.z * x_scale - camera.near + camera.position.z;
      //console.log(p_3d.z);
      p_3d = ProjScale(p_3d, camera.position, camera.near, dist_from_cam);
      pose3dDict[key] = p_3d.add(offset);
    }

    return pose3dDict;
  }

  {
    let pose_landmarks_dict = {};
    results.poseLandmarks.forEach((landmark, i) => {
      //console.log(i, landmark);
      //console.log(index_to_name[i]);
      pose_landmarks_dict[index_to_name[i]] = landmark;
    });

    let pos_3d_landmarks = update3dpose(
      camera_world,
      1.5,
      new THREE.Vector3(1, 0, -1.5),
      pose_landmarks_dict
    );
    //console.log(pos_3d_landmarks["left_heel"]);

    let i = 0;
    for (const [key, value] of Object.entries(pos_3d_landmarks)) {
      test_points.geometry.attributes.position.array[3 * i + 0] = value.x;
      test_points.geometry.attributes.position.array[3 * i + 1] = value.y;
      test_points.geometry.attributes.position.array[3 * i + 2] = value.z;
      i++;
    }
    test_points.geometry.attributes.position.needsUpdate = true;

    test_points_aux.geometry.attributes.position.array[0] =
      (test_points.geometry.attributes.position.array[69] +
        test_points.geometry.attributes.position.array[72]) /
      2;
    test_points_aux.geometry.attributes.position.array[1] =
      (test_points.geometry.attributes.position.array[70] +
        test_points.geometry.attributes.position.array[73]) /
      2;
    test_points_aux.geometry.attributes.position.array[2] =
      (test_points.geometry.attributes.position.array[71] +
        test_points.geometry.attributes.position.array[74]) /
      2;

    test_points_aux.geometry.attributes.position.array[3] =
      (test_points.geometry.attributes.position.array[33] +
        test_points.geometry.attributes.position.array[36]) /
      2;
    test_points_aux.geometry.attributes.position.array[4] =
      (test_points.geometry.attributes.position.array[34] +
        test_points.geometry.attributes.position.array[37]) /
      2;
    test_points_aux.geometry.attributes.position.array[5] =
      (test_points.geometry.attributes.position.array[35] +
        test_points.geometry.attributes.position.array[38]) /
      2;

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    test_points_aux.geometry.attributes.position.needsUpdate = true;

    skeleton.bones[0].position.x =
      test_points_aux.geometry.attributes.position.array[0] * 100;
    skeleton.bones[0].position.y =
      test_points_aux.geometry.attributes.position.array[1] * 100;
    skeleton.bones[0].position.z =
      test_points_aux.geometry.attributes.position.array[2] * 100;
    console.log(
      skeleton.bones[0].position.x,
      skeleton.bones[0].position.y,
      skeleton.bones[0].position.z
    );

    // rigging //
    //mixamorigLeftArm : left_shoulder
    //mixamorigLeftForeArm : left_elbow
    //mixamorigLeftHand : left_wrist
    //mixamorigLeftHandThumb4 : left_thumb
    //mixamorigLeftHandIndex4 : left_index
    //mixamorigLeftHandPinky4 : left_pinky

    //mixamorigLeftUpLeg : left_hip
    //mixamorigLeftLeg : left_knee
    //mixamorigLeftFoot : left_ankle
    //mixamorigLeftToe_End : left_foot_index

    let j1, j2, j3, j3_2, j3_3;
    let R0, R1, R2, R2_2, R2_3;
    let Rv12, Rv23, Rv23_2, Rv23_3;
    let v01, v12, v23;
    let v23_2, v23_3;

    console.log(skeleton);

    let jointLeftShoulder = pos_3d_landmarks["left_shoulder"]; // p0
    let jointLeftElbow = pos_3d_landmarks["left_elbow"]; // p1
    let boneLeftArm = skeleton.getBoneByName("mixamorigLeftForeArm"); // j1

    v01 = new THREE.Vector3()
      .subVectors(jointLeftElbow, jointLeftShoulder)
      .normalize();
    j1 = boneLeftArm.position.clone().normalize();
    R0 = computeR(j1, v01);
    skeleton.getBoneByName("mixamorigLeftArm").setRotationFromMatrix(R0);

    let jointLeftWrist = pos_3d_landmarks["left_wrist"]; // p2
    let boneLeftForeArm = skeleton.getBoneByName("mixamorigLeftHand"); // j2
    v12 = new THREE.Vector3()
      .subVectors(jointLeftWrist, jointLeftElbow)
      .normalize();
    j2 = boneLeftForeArm.position.clone().normalize();
    Rv12 = v12.clone().applyMatrix4(R0.clone().transpose());
    R1 = computeR(j2, Rv12);
    skeleton.getBoneByName("mixamorigLeftForeArm").setRotationFromMatrix(R1);
    //console.log(boneLeftArm);

    let jointLeftThumb = pos_3d_landmarks["left_thumb"]; //
    let boneLeftHandThumb = skeleton.getBoneByName("mixamorigLeftHandThumb4"); //
    v23 = new THREE.Vector3()
      .subVectors(jointLeftThumb, jointLeftWrist)
      .normalize();
    j3 = boneLeftHandThumb.position.clone().normalize();
    Rv23 = v23.clone().applyMatrix4(R1.clone().transpose());
    R2 = computeR(j3, Rv23);
    skeleton.getBoneByName("mixamorigLeftHand").setRotationFromMatrix(R2);

    let jointLeftIndex = pos_3d_landmarks["left_index"]; //
    let boneLeftHandIndex4 = skeleton.getBoneByName("mixamorigLeftHandIndex4"); //
    v23_2 = new THREE.Vector3()
      .subVectors(jointLeftIndex, jointLeftWrist)
      .normalize();
    j3_2 = boneLeftHandIndex4.position.clone().normalize();
    Rv23_2 = v23_2.clone().applyMatrix4(R0.clone().transpose());
    R2_2 = computeR(j3_2, Rv23_2);
    skeleton.getBoneByName("mixamorigLeftHand").setRotationFromMatrix(R2_2);

    let jointLeftPinky = pos_3d_landmarks["left_pinky"]; //
    let boneLeftHandPinky4 = skeleton.getBoneByName("mixamorigLeftHandPinky4"); //
    v23_3 = new THREE.Vector3()
      .subVectors(jointLeftPinky, jointLeftWrist)
      .normalize();
    j3_3 = boneLeftHandPinky4.position.clone().normalize();
    Rv23_3 = v23_3.clone().applyMatrix4(R0.clone().transpose());
    R2_3 = computeR(j3_3, Rv23_3);
    skeleton.getBoneByName("mixamorigLeftHand").setRotationFromMatrix(R2_3);

    // Left Lower -------------------------------------------------------------------

    let jointLeftHip = pos_3d_landmarks["left_hip"]; // p0
    let jointLeftKnee = pos_3d_landmarks["left_knee"]; // p1
    let boneLeftLeg = skeleton.getBoneByName("mixamorigLeftLeg"); // j1

    v01 = new THREE.Vector3()
      .subVectors(jointLeftKnee, jointLeftHip)
      .normalize();
    j1 = boneLeftLeg.position.clone().normalize();
    R0 = computeR(j1, v01);
    skeleton.getBoneByName("mixamorigLeftUpLeg").setRotationFromMatrix(R0);
    v01 = new THREE.Vector3()
      .subVectors(jointLeftKnee, jointLeftHip)
      .normalize();
    j1 = boneLeftLeg.position.clone().normalize();
    R0 = computeR(j1, v01);
    skeleton.getBoneByName("mixamorigLeftUpLeg").setRotationFromMatrix(R0);

    let jointLeftAnkle = pos_3d_landmarks["left_ankle"]; // p2
    let boneLeftFoot = skeleton.getBoneByName("mixamorigLeftFoot"); // j2
    v12 = new THREE.Vector3()
      .subVectors(jointLeftAnkle, jointLeftKnee)
      .normalize();
    j2 = boneLeftFoot.position.clone().normalize();
    Rv12 = v12.clone().applyMatrix4(R0.clone().transpose());
    R1 = computeR(j2, Rv12);
    skeleton.getBoneByName("mixamorigLeftLeg").setRotationFromMatrix(R1);
    //console.log(boneLeftLeg);

    let boneLeftrigLeftToe_End = skeleton.getBoneByName("mixamorigLeftToe_End"); //
    v23 = new THREE.Vector3()
      .subVectors(jointLeftAnkle, jointLeftAnkle)
      .normalize();
    j3 = boneLeftrigLeftToe_End.position.clone().normalize();
    Rv23 = v23.clone().applyMatrix4(R1.clone().transpose());
    R2 = computeR(j3, Rv23);
    skeleton.getBoneByName("mixamorigLeftFoot").setRotationFromMatrix(R2);
    /////////////////////////////////////////////////////////////////////////////////
    let jointRightShoulder = pos_3d_landmarks["right_shoulder"]; // p0
    let jointRightElbow = pos_3d_landmarks["right_elbow"]; // p1
    let boneRightArm = skeleton.getBoneByName("mixamorigRightForeArm"); // j1
    v01 = new THREE.Vector3()
      .subVectors(jointRightElbow, jointRightShoulder)
      .normalize();
    j1 = boneRightArm.position.clone().normalize();
    R0 = computeR(j1, v01);
    skeleton.getBoneByName("mixamorigRightArm").setRotationFromMatrix(R0);

    let jointRightWrist = pos_3d_landmarks["right_wrist"]; // p2
    let boneRightForeArm = skeleton.getBoneByName("mixamorigRightHand"); // j2
    v12 = new THREE.Vector3()
      .subVectors(jointRightWrist, jointRightElbow)
      .normalize();
    j2 = boneRightForeArm.position.clone().normalize();
    Rv12 = v12.clone().applyMatrix4(R0.clone().transpose());
    R1 = computeR(j2, Rv12);
    skeleton.getBoneByName("mixamorigRightForeArm").setRotationFromMatrix(R1);
    //console.log(boneRightArm);

    let jointRightThumb = pos_3d_landmarks["right_thumb"]; //
    let boneRightHandThumb = skeleton.getBoneByName("mixamorigRightHandThumb4"); //
    v23 = new THREE.Vector3()
      .subVectors(jointRightThumb, jointRightWrist)
      .normalize();
    j3 = boneRightHandThumb.position.clone().normalize();
    Rv23 = v23.clone().applyMatrix4(R1.clone().transpose());
    R2 = computeR(j3, Rv23);
    skeleton.getBoneByName("mixamorigRightHand").setRotationFromMatrix(R2);

    let jointRightIndex = pos_3d_landmarks["right_index"]; //
    let boneRightHandIndex4 = skeleton.getBoneByName(
      "mixamorigRightHandIndex4"
    ); //
    v23_2 = new THREE.Vector3()
      .subVectors(jointRightIndex, jointRightWrist)
      .normalize();
    j3_2 = boneRightHandIndex4.position.clone().normalize();
    Rv23_2 = v23_2.clone().applyMatrix4(R0.clone().transpose());
    R2_2 = computeR(j3_2, Rv23_2);
    skeleton.getBoneByName("mixamorigRightHand").setRotationFromMatrix(R2_2);

    let jointRightPinky = pos_3d_landmarks["right_pinky"]; //
    let boneRightHandPinky4 = skeleton.getBoneByName(
      "mixamorigRightHandPinky4"
    ); //
    v23_3 = new THREE.Vector3()
      .subVectors(jointRightPinky, jointRightWrist)
      .normalize();
    j3_3 = boneRightHandPinky4.position.clone().normalize();
    Rv23_3 = v23_3.clone().applyMatrix4(R0.clone().transpose());
    R2_3 = computeR(j3_3, Rv23_3);
    skeleton.getBoneByName("mixamorigRightHand").setRotationFromMatrix(R2_3);

    // Right Lower -------------------------------------------------------------------
    let jointRightHip = pos_3d_landmarks["right_hip"]; // p0
    let jointRightKnee = pos_3d_landmarks["right_knee"]; // p1
    let boneRightLeg = skeleton.getBoneByName("mixamorigRightLeg"); // j1
    v01 = new THREE.Vector3()
      .subVectors(jointRightKnee, jointRightHip)
      .normalize();
    j1 = boneRightLeg.position.clone().normalize();
    R0 = computeR(j1, v01);
    skeleton.getBoneByName("mixamorigRightUpLeg").setRotationFromMatrix(R0);

    let jointRightAnkle = pos_3d_landmarks["right_ankle"]; // p2
    let boneRightFoot = skeleton.getBoneByName("mixamorigRightFoot"); // j2
    v12 = new THREE.Vector3()
      .subVectors(jointRightAnkle, jointRightKnee)
      .normalize();
    j2 = boneRightFoot.position.clone().normalize();
    Rv12 = v12.clone().applyMatrix4(R0.clone().transpose());
    R1 = computeR(j2, Rv12);
    skeleton.getBoneByName("mixamorigRightLeg").setRotationFromMatrix(R1);
    //console.log(boneRightLeg);

    let boneRightrigRightToe_End = skeleton.getBoneByName(
      "mixamorigRightToe_End"
    ); //
    v23 = new THREE.Vector3()
      .subVectors(jointRightAnkle, jointRightAnkle)
      .normalize();
    j3 = boneRightrigRightToe_End.position.clone().normalize();
    Rv23 = v23.clone().applyMatrix4(R1.clone().transpose());
    R2 = computeR(j3, Rv23);
    skeleton.getBoneByName("mixamorigRightFoot").setRotationFromMatrix(R2);
  }

  renderer.render(scene, camera_ar);
  canvasCtx.restore();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults2);

videoElement.play();

async function detectionFrame() {
  await pose.send({ image: videoElement });
  videoElement.requestVideoFrameCallback(detectionFrame);
}

detectionFrame();
