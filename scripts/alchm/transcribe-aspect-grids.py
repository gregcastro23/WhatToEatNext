#!/usr/bin/env python3
"""
Transcribe the three aspect grids from the Alchm Semantics workbook into
structured JSON.

    python3 scripts/alchm/transcribe-aspect-grids.py out.json

Source is the "Dignity Tables" CSV export of the workbook (path below). The
grids are located by finding the row containing all eleven body names in order,
so they survive rows being inserted above them.

Three things this script exists to preserve, each of which was got wrong at
least once by reading the sheet directly:

  1. The lower and upper triangles are DIFFERENT ASPECTS, not a symmetric
     matrix. Sun->Moon reads (-Fire -Water) while Moon->Sun reads
     (+Fire +Water +Fire +Water). Reading them as symmetric merges conjunction
     with opposition.

  2. `x` is a RUNTIME SLOT, not missing data. It resolves to the element of a
     sign placement at computation time, and 106 of the 308 value-bearing cells
     contain one. Treating them as holes badly understates the grids.

  3. `*` means ASTRONOMICALLY IMPOSSIBLE, not unfilled. The 21 such cells match
     the author's own margin notes about maximum elongations. Only ONE cell in
     any grid is genuinely empty (Saturn x Jupiter trine).

Output counts are pinned by src/__tests__/data/alchmModel.test.ts.
See docs/physics/SYNTHESIS_MODEL.md section 5.
"""
import csv, json, re, sys
SRC='/Users/cookingwithcastro/Downloads/Alchm Semantics - Dignity Tables.csv'
P=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant']
ELEM={'🔥':'Fire','💧':'Water','🜃':'Ground','💨':'Air'}
ESMS={'🝇':'Spirit','🝑':'Essence','🝙':'Matter','🝉':'Substance'}

GRIDS=[
 dict(id='elemental-conjunction-opposition', header=8,  col=25, compass='element',
      lower='conjunction', upper='opposition', lowerOrb='within 10°', upperOrb='175–185°'),
 dict(id='elemental-trine-square',           header=29, col=25, compass='element',
      lower='trine',       upper='square',     lowerOrb='unstated',   upperOrb='90°, within 5°'),
 dict(id='esms-conjunction-opposition',      header=52, col=24, compass='esms',
      lower='conjunction', upper='opposition', lowerOrb='within 10°', upperOrb='175–185°'),
]

def parse(raw):
    """Parse one cell into a structured term list."""
    s=raw.strip()
    if s=='' : return dict(kind='empty')
    if s=='-': return dict(kind='self')
    if s=='*': return dict(kind='impossible')
    body=s.strip('()').strip()
    # split on '/' but keep glyph runs together
    terms=[]
    # walk characters, tracking a pending sign
    sign=1; pending=None
    i=0
    while i < len(body):
        ch=body[i]
        if ch=='-': sign=-1; i+=1; continue
        if ch=='+': sign=+1; pending='abstract'; i+=1; continue
        if ch in ' /': i+=1; continue
        if ch in ELEM:
            terms.append(dict(axis=ELEM[ch], sign=sign)); sign=1; pending=None; i+=1; continue
        if ch in ESMS:
            terms.append(dict(axis=ESMS[ch], sign=sign)); sign=1; pending=None; i+=1; continue
        if ch=='x':
            terms.append(dict(axis='SIGN_ELEMENT_OF_OTHER', sign=sign, slot=True)); sign=1; pending=None; i+=1; continue
        if ch=='y':
            terms.append(dict(axis='SIGN_ELEMENT_OF_SELF', sign=sign, slot=True, undefined=True)); sign=1; pending=None; i+=1; continue
        i+=1
    if not terms and pending=='abstract':
        n=body.count('+')-body.count('-')
        return dict(kind='abstract', magnitude=n)
    # bare +/- with no glyph => abstract magnitude
    if all(t.get('axis') is None for t in terms) and not terms:
        return dict(kind='abstract', magnitude=body.count('+')-body.count('-'))
    return dict(kind='terms', terms=terms, raw=s)

rows=list(csv.reader(open(SRC)))
out=dict(
  source='Alchm Semantics — Dignity Tables tab',
  transcribed='2026-07-20',
  provenance='CANVAS',
  note='Lower triangle and upper triangle are DIFFERENT aspects. See SYNTHESIS_MODEL.md §5.',
  bodies=P, grids=[])

stats={}
for g in GRIDS:
    hr, hc = g['header'], g['col']
    cells=[]
    for ri in range(hr+1, hr+12):
        r=rows[ri]
        label=r[hc-1].strip()
        if label not in P: continue
        for j,col in enumerate(P):
            raw = r[hc+j] if hc+j < len(r) else ''
            a,b = label, col
            ia, ib = P.index(a), P.index(b)
            if ia==ib: aspect='self'
            elif ia>ib: aspect=g['lower']   # row index greater => below diagonal
            else:       aspect=g['upper']
            p=parse(raw)
            cells.append(dict(row=a, col=b, aspect=aspect, **p))
    k=dict(id=g['id'], compass=g['compass'],
           lowerTriangle=dict(aspect=g['lower'], orb=g['lowerOrb']),
           upperTriangle=dict(aspect=g['upper'], orb=g['upperOrb']),
           cells=cells)
    out['grids'].append(k)
    from collections import Counter
    stats[g['id']]=Counter(c['kind'] for c in cells)

# flag the known outliers
FLAG={('Uranus','Sun'):'Byte-identical to Saturn×Sun above it and contains Ground, which is Saturn\'s element not Uranus\'s. Probable fill-down slip. See §5b.',
      ('Mars','Moon'):'Contains Ground, an element neither planet carries. Probable slip; the fitted rule adjudicates. See §5b.'}
n=0
for g in out['grids']:
    for c in g['cells']:
        if (c['row'],c['col']) in FLAG and g['id']=='elemental-conjunction-opposition' and c['kind']=='terms':
            c['flag']='OPEN'; c['flagReason']=FLAG[(c['row'],c['col'])]; n+=1
        if c['kind']=='empty' and c['row']!=c['col']:
            c['flag']='OPEN'; c['flagReason']='Only genuinely empty cell in any grid.'

# --- authored corrections -------------------------------------------------
# The Saturn row of the ESMS grid is a fill-down from the Jupiter row directly
# above it: 9 of 11 cells are byte-identical, and the two planets' ESMS pairs
# differ (Jupiter is Spirit/Essence, Saturn is Spirit/Matter), so identity can
# only be a copy. That import put Jupiter's Essence into two Saturn cells, the
# only two violations of the synthesis-pool constraint. Substituting Saturn's
# own second axis restores the constraint to 84/84.
# The canvas value is preserved on each corrected cell. See SYNTHESIS_MODEL.md
# sections 5b and 12.
CORRECT = {('Saturn','Sun','conjunction'), ('Saturn','Mercury','conjunction')}
CORRECT_REASON = ("Fill-down from the Jupiter row directly above (9/11 cells byte-identical, and the two "
    "planets' ESMS pairs differ, so identity can only be a copy). Essence is Jupiter's axis; "
    "Saturn is Spirit/Matter. Corrected by substituting Saturn's own second axis, Matter, "
    "which restores the synthesis-pool constraint to 100%. Canvas value preserved below. "
    "See SYNTHESIS_MODEL.md \u00a75b, \u00a712.")
ncorr = 0
for _g in out['grids']:
    if _g['id'] != 'esms-conjunction-opposition':
        continue
    for _c in _g['cells']:
        if (_c['row'], _c['col'], _c['aspect']) in CORRECT and _c['kind'] == 'terms':
            _c['canvasRaw'] = _c.get('raw')
            _c['canvasAxes'] = [t['axis'] for t in _c['terms']]
            for _t in _c['terms']:
                if _t['axis'] == 'Essence':
                    _t['axis'] = 'Matter'
            _c['provenance'] = 'AUTHORED'
            _c['correctionReason'] = CORRECT_REASON
            _c.pop('flag', None); _c.pop('flagReason', None)
            ncorr += 1

json.dump(out, open(sys.argv[1],'w'), ensure_ascii=False, indent=1)
for k,v in stats.items(): print(f'{k:36} {dict(v)}')
print(f'\nflagged outliers: {n}   authored corrections: {ncorr}')
tot=sum(sum(v.values()) for v in stats.values())
pop=sum(v['terms']+v.get('abstract',0) for v in stats.values())
se=sum(v['self'] for v in stats.values()); im=sum(v.get('impossible',0) for v in stats.values()); em=sum(v.get('empty',0) for v in stats.values())
print('total cells %d   value-bearing %d   self %d   impossible %d   empty %d'%(tot,pop,se,im,em))
