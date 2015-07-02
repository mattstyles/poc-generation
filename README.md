# Concept work

> Using simplex to procedurally generate terrain

## Overlapping chunks

The map is split up into chunks, each of these chunks are over-sized so that they overlap. This is to eliminate hard borders. Take the example of generating a chunk at 1,1 where 1,0 is already generated.

```
// Chunk size is 16x16
1 Generate 1,1 to be size 32x32 (0 offset so 31,31
  Visible region of chunk is 8,8 - 23,23
  Chunk 1,0 bottom region (0,24-0,31) overlaps into chunk 1,1
2 For chunk 1,1 region 0,0-31,7 use chunk 1,0 region 0,16-0,23 as is
3 For chunk 1,1 region 0,8-0,23 use chunk 1,0 region 0,24-0,31 but
    linearly interpolate based on distance from edge
```

Where more edges already exist repeat steps 2-3 for those other edges.
