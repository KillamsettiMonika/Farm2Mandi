#!/usr/bin/env python3
import os

team_dir = r"c:\Users\monik\OneDrive\Desktop\farm-mandi\frontend\src\assets\team"
colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
names = ['Monika', 'Dhanalaxmi', 'Srinivas', 'Joshi']

os.makedirs(team_dir, exist_ok=True)

for idx, name in enumerate(names):
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="{colors[idx]}"/>
  <text x="150" y="150" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">
    {name[0]}
  </text>
</svg>'''
    
    filename = f"{team_dir}/{name.lower().replace(' ', '')}.svg"
    with open(filename, 'w') as f:
        f.write(svg)
    print(f"Created {filename}")
