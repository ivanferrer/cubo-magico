#!/usr/bin/env python3
"""
Tests for the magic cube implementation
"""

import unittest
from cubo_magico import (
    create_simple_magic_cube,
    calculate_magic_constant,
    validate_magic_cube
)


class TestCuboMagico(unittest.TestCase):
    """Test cases for magic cube functions"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.cube = create_simple_magic_cube()
        self.n = 3
        
    def test_cube_dimensions(self):
        """Test that cube has correct dimensions"""
        self.assertEqual(len(self.cube), 3)
        for layer in self.cube:
            self.assertEqual(len(layer), 3)
            for row in layer:
                self.assertEqual(len(row), 3)
    
    def test_cube_uses_valid_numbers(self):
        """Test that cube uses positive integers"""
        for layer in self.cube:
            for row in layer:
                for num in row:
                    self.assertIsInstance(num, int)
                    self.assertGreater(num, 0, "All numbers should be positive")
    
    def test_magic_constant_calculation(self):
        """Test magic constant calculation"""
        # For 3x3x3 cube: 3(27+1)/2 = 42
        self.assertEqual(calculate_magic_constant(3), 42)
        # For 5x5x5 cube: 5(125+1)/2 = 315
        self.assertEqual(calculate_magic_constant(5), 315)
    
    def test_all_rows_sum_to_constant(self):
        """Test that all rows sum to magic constant"""
        magic_constant = 42
        for i in range(3):
            for j in range(3):
                row_sum = sum(self.cube[i][j][k] for k in range(3))
                self.assertEqual(row_sum, magic_constant,
                               f"Row at layer {i}, row {j} doesn't sum to {magic_constant}")
    
    def test_all_columns_sum_to_constant(self):
        """Test that all columns sum to magic constant"""
        magic_constant = 42
        for i in range(3):
            for k in range(3):
                col_sum = sum(self.cube[i][j][k] for j in range(3))
                self.assertEqual(col_sum, magic_constant,
                               f"Column at layer {i}, col {k} doesn't sum to {magic_constant}")
    
    def test_all_pillars_sum_to_constant(self):
        """Test that all pillars sum to magic constant"""
        magic_constant = 42
        for j in range(3):
            for k in range(3):
                pillar_sum = sum(self.cube[i][j][k] for i in range(3))
                self.assertEqual(pillar_sum, magic_constant,
                               f"Pillar at row {j}, col {k} doesn't sum to {magic_constant}")
    
    def test_validate_function(self):
        """Test the validation function"""
        is_valid, magic_constant, issues = validate_magic_cube(self.cube, check_diagonals=False)
        self.assertTrue(is_valid, f"Cube validation failed: {issues}")
        self.assertEqual(magic_constant, 42)
        self.assertEqual(len(issues), 0)


if __name__ == '__main__':
    unittest.main()
