"""Image processing utilities."""


def parse_resolution(resolution: str) -> tuple[int, int]:
    """Parse resolution string like '1024x1024' into (width, height)."""
    parts = resolution.lower().split('x')
    if len(parts) != 2:
        return (1024, 1024)
    try:
        return (int(parts[0]), int(parts[1]))
    except ValueError:
        return (1024, 1024)


def needs_upscale(output_resolution: str) -> bool:
    """Check if the target resolution requires upscaling (>1024)."""
    width, height = parse_resolution(output_resolution)
    return width > 1024 or height > 1024
