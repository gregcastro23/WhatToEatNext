import type { SkeletonLandmark } from "./skeletonLandmarks";

/**
 * Skeletal landmarks for lamb, poultry and finfish (primal-group-local
 * coordinates; see `skeletonLandmarkData.ts` for the frame convention).
 *
 * @file src/lib/butcher/stage/skeletonLandmarkData2.ts
 */

export const LAMB_SKELETON: readonly SkeletonLandmark[] = [
  { id: "lamb-thoracic-spine", label: "Thoracic vertebrae", primalId: "lamb-rack", radius: 0.026,
    start: [-0.3, 0.1, -0.08], end: [0.3, 0.1, -0.08], explainsCutIds: ["rack-of-lamb"],
    note: "The eye of the rack is the longissimus resting on these vertebrae, which the butcher chines off so the rack can be carved into chops." },
  { id: "lamb-rib-front", label: "Rack rib (front)", primalId: "lamb-rack", radius: 0.012,
    start: [-0.18, 0.1, -0.06], end: [-0.16, -0.18, 0.06], explainsCutIds: ["rack-of-lamb", "lamb-breast"],
    note: "Frenched rack bones are these rib bodies scraped clean; their lower ends continue into the lamb breast." },
  { id: "lamb-rib-mid", label: "Rack rib (middle)", primalId: "lamb-rack", radius: 0.012,
    start: [0, 0.1, -0.06], end: [0.02, -0.18, 0.06], explainsCutIds: ["rack-of-lamb"],
    note: "Each rib chop is cut between two of these bones, so a rack's chop count equals its rib count." },
  { id: "lamb-rib-rear", label: "Rack rib (rear)", primalId: "lamb-rack", radius: 0.012,
    start: [0.18, 0.1, -0.06], end: [0.2, -0.18, 0.06], explainsCutIds: ["rack-of-lamb", "lamb-breast"],
    note: "The last rack rib sits next to the loin, where the eye muscle becomes the loin chop." },
  { id: "lamb-lumbar-spine", label: "Lumbar vertebrae", primalId: "lamb-loin", radius: 0.026,
    start: [-0.24, 0.04, -0.06], end: [0.24, 0.04, -0.06], explainsCutIds: ["lamb-loin-chop"],
    note: "A lamb loin chop is a slice through one lumbar vertebra, with the loin eye on one side of the T and the tenderloin on the other." },
  { id: "lamb-scapula", label: "Scapula (blade bone)", primalId: "lamb-shoulder", radius: 0.028,
    start: [-0.12, 0.16, 0.04], end: [0.1, -0.14, 0.04], explainsCutIds: ["lamb-shoulder-roast"],
    note: "The shoulder's many small muscles meet at the blade bone, which makes the roast marbled but awkward to carve unless it is boned out." },
  { id: "lamb-femur", label: "Femur", primalId: "lamb-leg", radius: 0.032,
    start: [-0.14, 0.14, -0.02], end: [0.12, -0.16, -0.02], explainsCutIds: ["leg-of-lamb"],
    note: "A bone-in leg of lamb is carved around the femur, and boning it out leaves the classic butterflied leg." },
  { id: "lamb-radius-ulna", label: "Radius & ulna", primalId: "lamb-breast-shank", radius: 0.022,
    start: [-0.55, 0.12, 0.05], end: [-0.55, -0.24, 0.05], explainsCutIds: ["lamb-shank"],
    note: "The shank is the radius and ulna wrapped in tendon-rich muscle, so it needs a long braise to turn its collagen into gelatin." },
];

export const POULTRY_SKELETON: readonly SkeletonLandmark[] = [
  { id: "poultry-keel", label: "Keel (sternum)", primalId: "front-breast", radius: 0.016,
    start: [-0.26, -0.12, -0.12], end: [0.24, -0.15, -0.12], explainsCutIds: ["breast-supreme", "chicken-tenderloin"],
    note: "Both breast muscles anchor to the keel, with the tenderloin (pectoralis minor) lying right against it and the suprême on top, so you cut down along the keel to free them." },
  { id: "poultry-furcula", label: "Wishbone (furcula)", primalId: "front-breast", radius: 0.008,
    start: [-0.3, 0.16, -0.02], end: [-0.22, -0.08, -0.06], explainsCutIds: ["breast-supreme"],
    note: "The wishbone sits at the front of the breast, and taking it out first lets the suprême come off the keel in one clean piece." },
  { id: "poultry-humerus", label: "Humerus", primalId: "wing-section", radius: 0.012,
    start: [0.22, 0.04, -0.02], end: [0.02, 0, 0], explainsCutIds: ["chicken-wing"],
    note: "The drumette is the meat around the humerus, which is why the wing is taken off at the shoulder joint." },
  { id: "poultry-radius-ulna", label: "Radius & ulna", primalId: "wing-section", radius: 0.008,
    start: [0.02, 0, 0], end: [-0.2, -0.04, 0.02], explainsCutIds: ["chicken-wing"],
    note: "The flat holds the paired radius and ulna, so wings are split at the elbow where those bones meet the humerus." },
  { id: "poultry-femur", label: "Femur", primalId: "dark-leg", radius: 0.014,
    start: [-0.28, 0.1, -0.02], end: [0.16, 0.02, 0], explainsCutIds: ["chicken-thigh"],
    note: "The thigh is the meat around the femur, and the knee joint where it meets the drumstick is the natural line for separating the leg." },
  { id: "poultry-tibiotarsus", label: "Tibiotarsus", primalId: "dark-leg", radius: 0.012,
    start: [0.22, -0.02, 0.04], end: [0.22, -0.38, 0.04], explainsCutIds: ["chicken-drumstick"],
    note: "The drumstick's muscles wrap the tibiotarsus, and their tendons run down to the narrow knuckle end." },
  { id: "poultry-synsacrum", label: "Spine & synsacrum", primalId: "back-frame", radius: 0.02,
    start: [-0.36, -0.04, -0.1], end: [0.3, 0, -0.1], explainsCutIds: ["carcass-back", "chicken-oyster"],
    note: "The oyster sits in a hollow of the pelvis beside the spine, so it stays on the back unless you scoop it out when removing the thigh." },
];

export const FINFISH_SKELETON: readonly SkeletonLandmark[] = [
  { id: "finfish-cleithrum", label: "Cleithrum (collar bone)", primalId: "collar", radius: 0.014,
    start: [0.12, 0.18, 0], end: [0.02, -0.18, 0.02], explainsCutIds: ["collar-kama"],
    note: "The kama is the muscle and fat attached to the cleithrum and pectoral fin girdle, which is why it is grilled on the bone." },
  { id: "finfish-spine-anterior", label: "Vertebral column (front)", primalId: "dorsal-loin", radius: 0.018,
    start: [-0.5, -0.13, -0.06], end: [0.62, -0.15, -0.06], explainsCutIds: ["loin-top", "center-fillet"],
    note: "The backbone separates the thick dorsal loin above from the thin, fatty belly below, so fillets are lifted off it from head to tail." },
  { id: "finfish-pin-bones", label: "Pin-bone line", primalId: "dorsal-loin", radius: 0.006,
    start: [-0.42, -0.06, 0.08], end: [0.24, -0.08, 0.08], explainsCutIds: ["loin-top", "center-fillet"],
    note: "Pin bones run along the lateral line in the front two-thirds of the fillet, so loin and centre-cut portions need to be tweezered." },
  { id: "finfish-belly-rib-front", label: "Pleural ribs (front)", primalId: "ventral-belly", radius: 0.007,
    start: [-0.22, 0.12, -0.04], end: [-0.18, -0.1, 0.02], explainsCutIds: ["belly-toro"],
    note: "The pleural ribs line the belly cavity, and toro is trimmed off their surface along with the fatty belly flap." },
  { id: "finfish-belly-rib-rear", label: "Pleural ribs (rear)", primalId: "ventral-belly", radius: 0.007,
    start: [0.1, 0.12, -0.04], end: [0.14, -0.1, 0.02], explainsCutIds: ["belly-toro"],
    note: "The ribs stop at the vent, so the belly behind them comes away boneless." },
  { id: "finfish-spine-caudal", label: "Vertebral column (tail)", primalId: "caudal-tail", radius: 0.014,
    start: [-0.42, 0.02, -0.06], end: [0.22, 0, -0.06], explainsCutIds: ["tail-piece"],
    note: "Behind the vent the backbone has no ribs or pin bones, so the tail piece is boneless but thin and lean." },
];
