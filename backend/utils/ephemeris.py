"""The one place the process's Swiss Ephemeris path is set.

`swe.set_ephe_path` changes PROCESS-WIDE state: whichever path was set last decides which ephemeris
every later `swe.calc_ut` and `swe.rise_trans` in the process reads, whoever asks. The engines each
set it for themselves, and not to the same thing:

    celestial_calculations          once, at import     <repo>/sweph_ephe if it exists, else the relative 'sweph_ephe'
    transmutation_oracle            once, at import     $SWISSEPH_PATH, else <repo>/sweph_ephe
    lunar_oracle, transit_engine    on EVERY call       ''  (and two routes in alchm_kitchen/main.py)

'' is the library's default search path ('.:/users/ephe2/:/users/ephe/', swisseph.EPHE_PATH): no files.
The repo tracks sweph_ephe/ (the Sun, planets and Moon for 1200-2399 CE) and .railwayignore keeps it out of
the deployed image, so in production every call is served by the library's built-in Moshier ephemeris and
the resets changed nothing. In a checkout that has the directory (development, CI) the first transit or
lunar query switched every LATER chart in the process from the Swiss Ephemeris files to Moshier, a few
arcseconds away (0.06 to 2.6 for the Sun and the planets to Neptune, up to 6.8 for Pluto, measured over
48 dates in 1800-2200), so what a chart said depended on what had been asked before it.

Now the path is set here, once, when this module is first imported, and nothing else under backend/ names
`set_ephe_path` (backend/tests/test_ephemeris_path.py fails if something does). Take `swe` from this module
so that the path is always set before the library is used:

    from backend.utils.ephemeris import swe

`swe` is None when pyswisseph is not installed, as every caller used to arrange for itself.
"""
import os

try:
    import swisseph as swe
except ImportError:
    swe = None

# <repo>/sweph_ephe. This file is <repo>/backend/utils/ephemeris.py, as celestial_calculations.py was.
DEFAULT_EPHE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'sweph_ephe')

# What celestial_calculations fell back to when that directory is not there: relative to the working directory.
FALLBACK_EPHE_PATH = 'sweph_ephe'


def resolve_ephe_path(environ=None, default_dir=DEFAULT_EPHE_DIR, exists=os.path.exists):
    """The path to give `swe.set_ephe_path`.

    $SWISSEPH_PATH when it is set (transmutation_oracle's override, which its own warning tells the reader
    to use), else the repo's sweph_ephe/ when it exists, else the relative 'sweph_ephe'. Without the
    directory nothing is found and the library uses Moshier, as it did before.
    """
    environ = os.environ if environ is None else environ
    configured = environ.get('SWISSEPH_PATH')
    if configured is not None:
        return configured
    if exists(default_dir):
        return default_dir
    return FALLBACK_EPHE_PATH


EPHE_PATH = resolve_ephe_path()


def configure():
    """Point the library at EPHE_PATH. Runs once, on import; a test calls it to restore the configured state."""
    if swe is not None:
        swe.set_ephe_path(EPHE_PATH)


configure()
