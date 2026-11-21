import type { SkeletonLandmark } from "./skeletonLandmarks";

/**
 * Hand-authored skeletal landmarks for the 3D "X-ray" view. Coordinates are in
 * each PRIMAL group's local frame (the primal group sits at
 * `primal.restPosition`; its cuts sit at `cut.geometry3d.restPosition`), with
 * +x toward the hind end, +y dorsal, +z toward the camera (lateral face).
 * Positions are a schematic of the stage's cut layout, not a CT-derived
 * skeleton; each note says which nearby cut the bone explains.
 *
 * @file src/lib/butcher/stage/skeletonLandmarkData.ts
 */

export const BEEF_SKELETON: readonly SkeletonLandmark[] = [
  { id: "beef-chuck-spine", label: "Neck & thoracic vertebrae 1–5", primalId: "chuck", radius: 0.03,
    start: [-0.34, 0.14, -0.1], end: [0.36, 0.16, -0.1], explainsCutIds: ["chuck-eye"],
    note: "The chuck eye is the forward end of the same longissimus that becomes the ribeye, lying along the first five thoracic vertebrae." },
  { id: "beef-scapula", label: "Scapula (blade bone)", primalId: "chuck", radius: 0.03,
    start: [-0.18, 0.22, 0.02], end: [0.06, -0.12, 0.02], explainsCutIds: ["flat-iron", "denver-steak", "chuck-roast"],
    note: "The flat iron is the infraspinatus lying on the scapula and the Denver is the serratus ventralis beneath it, which is why chuck roasts are sold as bone-in blade roasts." },
  { id: "beef-thoracic-spine", label: "Thoracic vertebrae 6–12", primalId: "rib", radius: 0.032,
    start: [-0.3, 0.12, -0.1], end: [0.3, 0.12, -0.1], explainsCutIds: ["ribeye", "spinalis-cap", "prime-rib"],
    note: "The ribeye's longissimus and its spinalis cap rest on these vertebrae and the rib heads, so prime rib is roasted bone-in along this column." },
  { id: "beef-rib-6", label: "Rib 6", primalId: "rib", radius: 0.016,
    start: [-0.22, 0.1, -0.1], end: [-0.19, -0.3, 0.04], explainsCutIds: ["prime-rib", "short-ribs"],
    note: "The rib primal starts at the 6th rib; the short ribs are the lower ends of the same bones, cut off below the ribeye." },
  { id: "beef-rib-9", label: "Rib 9", primalId: "rib", radius: 0.016,
    start: [0, 0.1, -0.1], end: [0.03, -0.3, 0.04], explainsCutIds: ["ribeye", "short-ribs"],
    note: "Rib steaks are cut between these bones, so each bone-in ribeye carries one rib." },
  { id: "beef-rib-12", label: "Rib 12", primalId: "rib", radius: 0.016,
    start: [0.22, 0.1, -0.1], end: [0.25, -0.3, 0.04], explainsCutIds: ["prime-rib", "short-ribs"],
    note: "The 12th rib marks where the rib primal ends and the short loin begins." },
  { id: "beef-lumbar-spine", label: "Lumbar vertebrae", primalId: "short-loin", radius: 0.032,
    start: [-0.3, 0.02, -0.06], end: [0.3, 0.02, -0.06], explainsCutIds: ["ny-strip", "tenderloin-filet"],
    note: "The strip loin rides above the lumbar vertebrae and the tenderloin (psoas major) hangs beneath them, where it does almost no work." },
  { id: "beef-lumbar-transverse", label: "Transverse process (the T)", primalId: "short-loin", radius: 0.012,
    start: [-0.02, 0.02, -0.04], end: [-0.02, -0.1, 0.08], explainsCutIds: ["t-bone", "porterhouse"],
    note: "The T of a T-bone or porterhouse is this transverse process, with strip on one side and tenderloin on the other." },
  { id: "beef-pelvis", label: "Ilium & aitchbone (pelvis)", primalId: "sirloin", radius: 0.034,
    start: [0.12, 0.18, -0.06], end: [0.3, -0.16, 0], explainsCutIds: ["top-sirloin", "picanha", "tri-tip"],
    note: "The gluteus medius (top sirloin) and the rump cap (picanha) anchor on the hip bone, so the sirloin is separated from the round where the aitchbone ends." },
  { id: "beef-femur", label: "Femur", primalId: "round", radius: 0.04,
    start: [-0.2, 0.18, -0.04], end: [0.12, -0.26, -0.02], explainsCutIds: ["top-round", "bottom-round", "eye-of-round"],
    note: "The femur divides the round: the top round sits on its inner side, while the bottom round and eye of round sit on the outer side." },
  { id: "beef-sternum", label: "Sternum & costal cartilage", primalId: "brisket", radius: 0.026,
    start: [-0.3, -0.1, -0.02], end: [0.32, -0.06, -0.02], explainsCutIds: ["brisket-flat", "brisket-point"],
    note: "The pectoral muscles that make up the brisket attach to the sternum and carry the animal's weight, which is why the brisket is so high in collagen." },
  { id: "beef-radius-ulna", label: "Radius & ulna", primalId: "fore-shank", radius: 0.03,
    start: [0, 0.2, 0], end: [0, -0.2, 0], explainsCutIds: ["osso-buco-shank"],
    note: "Osso buco is cut across the radius and ulna, so every slice has a ring of marrow wrapped in collagen-rich shank muscle." },
];

export const PORK_SKELETON: readonly SkeletonLandmark[] = [
  { id: "pork-spine", label: "Thoracolumbar spine", primalId: "loin", radius: 0.03,
    start: [-0.4, 0, -0.06], end: [0.4, 0, -0.06], explainsCutIds: ["pork-loin-chop", "pork-tenderloin"],
    note: "The loin chop's longissimus rides on top of the vertebrae and the tenderloin hangs beneath the lumbar section, so one bone column separates the two." },
  { id: "pork-rib-front", label: "Front ribs", primalId: "belly-ribs", radius: 0.014,
    start: [-0.22, 0.34, -0.04], end: [-0.18, -0.08, 0.02], explainsCutIds: ["baby-back-ribs", "spare-ribs"],
    note: "Baby back ribs are the curved upper rib ends next to the spine, and spare ribs are the straighter lower part of the same bones." },
  { id: "pork-rib-mid", label: "Mid ribs", primalId: "belly-ribs", radius: 0.014,
    start: [0.02, 0.34, -0.04], end: [0.06, -0.08, 0.02], explainsCutIds: ["spare-ribs", "pork-belly"],
    note: "The belly is the muscle and fat peeled off the outside of these ribs, which is why pork belly is sold boneless." },
  { id: "pork-rib-rear", label: "Rear ribs", primalId: "belly-ribs", radius: 0.014,
    start: [0.26, 0.34, -0.04], end: [0.3, -0.08, 0.02], explainsCutIds: ["baby-back-ribs", "spare-ribs"],
    note: "Toward the loin end the ribs shorten, which is why a rack of baby backs tapers from one end to the other." },
  { id: "pork-scapula", label: "Scapula (blade bone)", primalId: "shoulder-butt", radius: 0.03,
    start: [-0.12, 0.16, 0.04], end: [0.1, -0.16, 0.04], explainsCutIds: ["boston-butt"],
    note: "The Boston butt is the shoulder above and around the blade bone, where several marbled muscles overlap, so it is often sold as a bone-in blade roast." },
  { id: "pork-humerus", label: "Humerus (arm bone)", primalId: "picnic-shoulder", radius: 0.03,
    start: [-0.06, 0.16, 0], end: [0.08, -0.16, 0.02], explainsCutIds: ["picnic-roast"],
    note: "The picnic is the arm below the shoulder joint, so it carries the humerus and more connective tissue than the butt above it." },
  { id: "pork-aitchbone", label: "Aitchbone (pelvis)", primalId: "ham-leg", radius: 0.03,
    start: [-0.26, 0.2, -0.04], end: [-0.12, 0.02, -0.04], explainsCutIds: ["fresh-ham"],
    note: "The ham is separated from the loin at the aitchbone, and the bone is usually removed so the ham carves cleanly." },
  { id: "pork-femur", label: "Femur", primalId: "ham-leg", radius: 0.036,
    start: [-0.12, 0.04, -0.02], end: [0.12, -0.2, -0.02], explainsCutIds: ["fresh-ham"],
    note: "A bone-in fresh ham is the large muscles of the thigh wrapped around the femur, so it is carved parallel to this bone." },
  { id: "pork-tibia-fibula", label: "Tibia & fibula", primalId: "hock", radius: 0.026,
    start: [0, 0.18, 0], end: [0, -0.18, 0], explainsCutIds: ["pork-hock"],
    note: "The hock is the shank around the tibia and fibula, mostly tendon and skin, which is why it needs long braising or smoking." },
];
