/**
 * IAPWS-IF97 coefficient tables, transcribed from the release.
 *
 * BASIS: IAPWS, "Revised Release on the IAPWS Industrial Formulation 1997 for
 * the Thermodynamic Properties of Water and Steam", IAPWS R7-97(2012).
 * Table 2 (region 1), Tables 10 and 11 (region 2), Table 34 (region 4).
 *
 * Nothing here is fitted or rounded by this repo. Two checks guard the
 * transcription, both in `__tests__/if97.test.ts`:
 * - the release's computer-program verification values (Tables 5, 15, 35 and
 *   36), printed to nine digits. Only ENTHALPY is computed here, and enthalpy
 *   uses γ_τ, whose terms are all multiplied by J — so rows with J = 0 never
 *   reach a verified number, and digits past the ninth are invisible to it;
 * - an independent transcription (`__tests__/fixtures/if97-transcription.json`)
 *   compared row by row, which covers every row and every digit.
 *
 * Rows are `[I, J, n]` (region 2 ideal-gas rows are `[J, n]`).
 *
 * @file src/lib/cooking/if97Coefficients.ts
 */

/** Specific gas constant of water used throughout IF97, kJ·kg⁻¹·K⁻¹ (R7-97 eq. 1). */
export const IF97_R_KJ_KG_K = 0.461526;

/** Region 4 saturation-line coefficients n1…n10 (Table 34). */
export const REGION4_N: readonly number[] = [
  0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.1202082470247e5,
  -0.32325550322333e7, 0.1491510861353e2, -0.48232657361591e4, 0.40511340542057e6,
  -0.23855557567849, 0.65017534844798e3,
];

/** Region 1 (compressed liquid) — Table 2. Reducing values p* = 16.53 MPa, T* = 1386 K. */
export const REGION1_IJN: ReadonlyArray<readonly [number, number, number]> = [
  [0, -2, 0.14632971213167], [0, -1, -0.84548187169114], [0, 0, -0.3756360367204e1],
  [0, 1, 0.33855169168385e1], [0, 2, -0.95791963387872], [0, 3, 0.15772038513228],
  [0, 4, -0.16616417199501e-1], [0, 5, 0.81214629983568e-3], [1, -9, 0.28319080123804e-3],
  [1, -7, -0.60706301565874e-3], [1, -1, -0.18990068218419e-1], [1, 0, -0.32529748770505e-1],
  [1, 1, -0.21841717175414e-1], [1, 3, -0.5283835796993e-4], [2, -3, -0.47184321073267e-3],
  [2, 0, -0.30001780793026e-3], [2, 1, 0.47661393906987e-4], [2, 3, -0.44141845330846e-5],
  [2, 17, -0.72694996297594e-15], [3, -4, -0.31679644845054e-4], [3, 0, -0.28270797985312e-5],
  [3, 6, -0.85205128120103e-9], [4, -5, -0.22425281908e-5], [4, -2, -0.65171222895601e-6],
  [4, 10, -0.14341729937924e-12], [5, -8, -0.40516996860117e-6], [8, -11, -0.12734301741641e-8],
  [8, -6, -0.17424871230634e-9], [21, -29, -0.68762131295531e-18], [23, -31, 0.14478307828521e-19],
  [29, -38, 0.26335781662795e-22], [30, -39, -0.11947622640071e-22], [31, -40, 0.18228094581404e-23],
  [32, -41, -0.93537087292458e-25],
];

/** Region 2 ideal-gas part — Table 10, rows `[J0, n0]`. Reducing values p* = 1 MPa, T* = 540 K. */
export const REGION2_IDEAL_JN: ReadonlyArray<readonly [number, number]> = [
  [0, -0.96927686500217e1], [1, 0.10086655968018e2], [-5, -0.5608791128302e-2],
  [-4, 0.71452738081455e-1], [-3, -0.40710498223928], [-2, 0.14240819171444e1],
  [-1, -0.4383951131945e1], [2, -0.28408632460772], [3, 0.21268463753307e-1],
];

/** Region 2 residual part — Table 11. */
export const REGION2_RESIDUAL_IJN: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, -0.17731742473213e-2], [1, 1, -0.17834862292358e-1], [1, 2, -0.45996013696365e-1],
  [1, 3, -0.57581259083432e-1], [1, 6, -0.5032527872793e-1], [2, 1, -0.33032641670203e-4],
  [2, 2, -0.18948987516315e-3], [2, 4, -0.39392777243355e-2], [2, 7, -0.43797295650573e-1],
  [2, 36, -0.26674547914087e-4], [3, 0, 0.20481737692309e-7], [3, 1, 0.43870667284435e-6],
  [3, 3, -0.3227767723857e-4], [3, 6, -0.15033924542148e-2], [3, 35, -0.40668253562649e-1],
  [4, 1, -0.78847309559367e-9], [4, 2, 0.12790717852285e-7], [4, 3, 0.48225372718507e-6],
  [5, 7, 0.22922076337661e-5], [6, 3, -0.16714766451061e-10], [6, 16, -0.21171472321355e-2],
  [6, 35, -0.23895741934104e2], [7, 0, -0.5905956432427e-17], [7, 11, -0.12621808899101e-5],
  [7, 25, -0.38946842435739e-1], [8, 8, 0.11256211360459e-10], [8, 36, -0.82311340897998e1],
  [9, 13, 0.19809712802088e-7], [10, 4, 0.10406965210174e-18], [10, 10, -0.10234747095929e-12],
  [10, 14, -0.10018179379511e-8], [16, 29, -0.80882908646985e-10], [16, 50, 0.10693031879409],
  [18, 57, -0.33662250574171], [20, 20, 0.89185845355421e-24], [20, 35, 0.30629316876232e-12],
  [20, 48, -0.42002467698208e-5], [21, 21, -0.59056029685639e-25], [22, 53, 0.37826947613457e-5],
  [23, 39, -0.12768608934681e-14], [24, 26, 0.73087610595061e-28], [24, 40, 0.55414715350778e-16],
  [24, 58, -0.9436970724121e-6],
];
