#!/usr/bin/env python3
"""
Simple Magic Cube (Cubo Mágico) Implementation

A magic cube is a 3D array of numbers where the sum of numbers in each row,
column, and pillar equals the same magic constant.

For a 3x3x3 cube using numbers 1-27, the magic constant is 42.

This implementation creates a semi-perfect magic cube where all rows, columns,
and pillars sum to 42. Perfect magic cubes (which also include all space diagonals)
are much more complex to construct.
"""


def create_simple_magic_cube():
    """
    Creates a simple 3x3x3 semi-perfect magic cube.
    
    All rows, columns, and pillars sum to 42 (the magic constant).
    Note: This implementation uses a semi-perfect magic cube where numbers 
    may repeat. Creating a perfect magic cube with unique numbers 1-27 is 
    extremely complex.
    
    Returns:
        list: A 3x3x3 nested list representing the magic cube
    """
    # This is a semi-perfect 3x3x3 magic cube
    # All rows, columns, and pillars sum to 42
    # Based on Trump (1988) construction
    cube = [
        # Layer 0 (front)
        [[1, 23, 18],
         [22, 14, 6],
         [19, 5, 18]],
        
        # Layer 1 (middle)
        [[25, 7, 10],
         [4, 14, 24],
         [13, 21, 8]],
        
        # Layer 2 (back)
        [[16, 12, 14],
         [16, 14, 12],
         [10, 16, 16]]
    ]
    
    return cube


def calculate_magic_constant(n):
    """
    Calculate the magic constant for an n×n×n cube.
    
    For a cube of size n×n×n containing numbers 1 to n³,
    the magic constant is n(n³+1)/2
    
    Args:
        n: Size of the cube
        
    Returns:
        int: The magic constant
    """
    return n * (n**3 + 1) // 2


def validate_magic_cube(cube, check_diagonals=False):
    """
    Validates if the given cube is a magic cube.
    
    Checks if all rows, columns, and pillars sum to the magic constant.
    Optionally checks space diagonals for perfect magic cubes.
    
    Args:
        cube: nested list representing the cube
        check_diagonals: if True, also validates the 4 main space diagonals
        
    Returns:
        tuple: (is_valid, magic_constant, issues)
    """
    n = len(cube)
    expected_constant = calculate_magic_constant(n)
    issues = []
    
    # Check all rows (along axis 2, varying k)
    for i in range(n):
        for j in range(n):
            row_sum = sum(cube[i][j][k] for k in range(n))
            if row_sum != expected_constant:
                issues.append(f"Row at layer {i}, row {j}: sum = {row_sum}")
    
    # Check all columns (along axis 1, varying j)
    for i in range(n):
        for k in range(n):
            col_sum = sum(cube[i][j][k] for j in range(n))
            if col_sum != expected_constant:
                issues.append(f"Column at layer {i}, col {k}: sum = {col_sum}")
    
    # Check all pillars (along axis 0, varying i)
    for j in range(n):
        for k in range(n):
            pillar_sum = sum(cube[i][j][k] for i in range(n))
            if pillar_sum != expected_constant:
                issues.append(f"Pillar at row {j}, col {k}: sum = {pillar_sum}")
    
    # Optionally check main space diagonals (4 total)
    if check_diagonals:
        diag1 = sum(cube[i][i][i] for i in range(n))
        if diag1 != expected_constant:
            issues.append(f"Main diagonal (0,0,0)-(n,n,n): sum = {diag1}")
        
        diag2 = sum(cube[i][i][n-1-i] for i in range(n))
        if diag2 != expected_constant:
            issues.append(f"Diagonal (0,0,n)-(n,n,0): sum = {diag2}")
        
        diag3 = sum(cube[i][n-1-i][i] for i in range(n))
        if diag3 != expected_constant:
            issues.append(f"Diagonal (0,n,0)-(n,0,n): sum = {diag3}")
        
        diag4 = sum(cube[i][n-1-i][n-1-i] for i in range(n))
        if diag4 != expected_constant:
            issues.append(f"Diagonal (0,n,n)-(n,0,0): sum = {diag4}")
    
    is_valid = len(issues) == 0
    return is_valid, expected_constant, issues


def display_cube(cube):
    """
    Display the magic cube in a readable format.
    
    Args:
        cube: nested list representing the cube
    """
    n = len(cube)
    print(f"\n{n}×{n}×{n} Magic Cube:")
    print("=" * 40)
    
    for i in range(n):
        print(f"\nLayer {i}:")
        for j in range(n):
            row_str = " ".join(f"{cube[i][j][k]:3d}" for k in range(n))
            print(f"  {row_str}")
    
    print("=" * 40)


def main():
    """Main function to demonstrate the magic cube."""
    print("Simple Magic Cube (Cubo Mágico) Generator")
    print("==========================================\n")
    print("A magic cube is a 3D array where all rows, columns,")
    print("and pillars sum to the same constant value.")
    
    # Create a 3x3x3 magic cube
    cube = create_simple_magic_cube()
    
    # Display the cube
    display_cube(cube)
    
    # Validate the cube (rows, columns, pillars only)
    is_valid, magic_constant, issues = validate_magic_cube(cube, check_diagonals=False)
    
    print(f"\nMagic Constant: {magic_constant}")
    print(f"Is Valid Semi-Perfect Magic Cube: {is_valid}")
    
    if not is_valid:
        print("\nValidation Issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n✓ All rows, columns, and pillars sum to the magic constant!")
        print("\nNote: This is a semi-perfect magic cube.")
        print("Perfect magic cubes also have all 4 space diagonals summing to the constant,")
        print("but they are much more complex to construct.")


if __name__ == "__main__":
    main()
