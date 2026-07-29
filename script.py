# python ./script.py ./ ./out.txt --not ./s.kt ./.gitignore ./script.py

from pathlib import Path
import sys
import pathspec

# --------------------------------------------------
# Parse required arguments
# --------------------------------------------------

if len(sys.argv) < 3:
    print(
        "Usage: python script.py <input_folder> <output_file> "
        "[true] [--not <path1> <path2> ...]"
    )
    sys.exit(1)


ROOT = Path(sys.argv[1]).resolve()
OUTPUT = Path(sys.argv[2])

SCRIPT_PATH = Path(__file__).resolve()
OUTPUT_PATH = OUTPUT.resolve()


# --------------------------------------------------
# Parse optional arguments
# --------------------------------------------------

SKIP_SELF = False
EXCLUDED_PATHS = []

args = sys.argv[3:]

i = 0

while i < len(args):
    arg = args[i]

    if arg.lower() == "true":
        SKIP_SELF = True
        i += 1

    elif arg == "--not":
        i += 1

        # --not must have at least one path
        if i >= len(args) or args[i].startswith("--"):
            print("Error: --not requires at least one path")
            sys.exit(1)

        # Collect all paths after --not until another option is found
        while i < len(args) and not args[i].startswith("--"):
            excluded = Path(args[i])

            # Resolve relative exclusion paths from ROOT
            if not excluded.is_absolute():
                excluded = (ROOT / excluded).resolve()
            else:
                excluded = excluded.resolve()

            EXCLUDED_PATHS.append(excluded)

            i += 1

    else:
        print(f"Unknown argument: {arg}")
        sys.exit(1)


# --------------------------------------------------
# Load .gitignore rules
# --------------------------------------------------

gitignore = ROOT / ".gitignore"

if gitignore.exists():
    spec = pathspec.PathSpec.from_lines(
        "gitwildmatch",
        gitignore.read_text(
            encoding="utf-8"
        ).splitlines()
    )
else:
    spec = pathspec.PathSpec.from_lines(
        "gitwildmatch",
        []
    )


# --------------------------------------------------
# Exclusion check
# --------------------------------------------------

def is_excluded(path: Path):
    """
    Exclude:
    - hidden files/folders (.git, .obsidian, etc.)
    - .gitignore itself
    - anything matched by .gitignore
    - the script itself if 'true' is passed
    - the output file
    - manually excluded files/directories from --not
    """

    resolved_path = path.resolve()


    # 1. Skip the script itself if requested

    if SKIP_SELF and resolved_path == SCRIPT_PATH:
        return True


    # 2. Always skip the output file

    if resolved_path == OUTPUT_PATH:
        return True


    # 3. Skip manually excluded files and directories

    for excluded in EXCLUDED_PATHS:

        # Exact file or directory match
        if resolved_path == excluded:
            return True

        # Anything inside an excluded directory
        try:
            resolved_path.relative_to(excluded)
            return True
        except ValueError:
            pass


    # 4. Get path relative to ROOT

    rel_path = path.relative_to(ROOT)

    rel = rel_path.as_posix()


    # 5. Skip .gitignore itself

    if rel == ".gitignore":
        return True


    # 6. Skip hidden files and folders

    if any(
        part.startswith(".")
        for part in rel_path.parts
    ):
        return True


    # 7. Apply .gitignore rules

    return spec.match_file(rel)


# --------------------------------------------------
# Build directory tree
# --------------------------------------------------

def build_tree(path: Path, prefix=""):

    entries = sorted(
        [
            p
            for p in path.iterdir()
            if not is_excluded(p)
        ],
        key=lambda p: (
            p.is_file(),
            p.name.lower()
        )
    )

    lines = []

    for i, entry in enumerate(entries):

        is_last = i == len(entries) - 1

        connector = (
            "└── "
            if is_last
            else "├── "
        )


        if entry.is_dir():

            lines.append(
                f"{prefix}{connector}{entry.name}/"
            )

            extension = (
                "    "
                if is_last
                else "│   "
            )

            lines.extend(
                build_tree(
                    entry,
                    prefix + extension
                )
            )

        else:

            lines.append(
                f"{prefix}{connector}{entry.name}"
            )

    return lines


# --------------------------------------------------
# Write export
# --------------------------------------------------

with open(
    OUTPUT,
    "w",
    encoding="utf-8"
) as out:


    # Write directory tree

    out.write(f"{ROOT.name}/\n")

    for line in build_tree(ROOT):
        out.write(line + "\n")


    # Collect all included files

    files = sorted(
        (
            p
            for p in ROOT.rglob("*")
            if p.is_file()
            and not is_excluded(p)
        ),
        key=lambda p:
            str(
                p.relative_to(ROOT)
            ).lower()
    )


    # Write file contents

    for file in files:

        rel_path = file.relative_to(ROOT)

        out.write("\n\n")

        out.write("=" * 120)
        out.write("\n")

        out.write(
            f"# FILE: {rel_path}\n"
        )

        out.write("⬇" * 20)
        out.write("\n\n")

        out.write("=" * 120)
        out.write("\n\n")


        try:
            out.write(
                file.read_text(
                    encoding="utf-8"
                )
            )

        except Exception as e:
            out.write(
                f"[ERROR READING FILE: {e}]"
            )


print(f"Export written to {OUTPUT}")

