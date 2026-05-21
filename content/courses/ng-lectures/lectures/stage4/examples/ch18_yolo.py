"""
第18章：目标检测基础 — IoU 与 Non-Max Suppression
Chapter 18: Object Detection — IoU & NMS
"""
import numpy as np

def compute_iou(box1, box2):
    """
    box = [x1, y1, x2, y2]
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = box1_area + box2_area - inter_area

    return inter_area / (union_area + 1e-6)

def nms(boxes, scores, iou_threshold=0.5):
    """Non-Maximum Suppression"""
    indices = np.argsort(scores)[::-1]
    keep = []

    while len(indices) > 0:
        current = indices[0]
        keep.append(current)

        if len(indices) == 1:
            break

        current_box = boxes[current]
        other_boxes = boxes[indices[1:]]

        ious = np.array([compute_iou(current_box, b) for b in other_boxes])
        mask = ious <= iou_threshold
        indices = indices[1:][mask]

    return keep

# 测试
boxes = np.array([
    [100, 100, 210, 210],   # 真实框附近
    [105, 105, 215, 215],   # 高度重叠
    [300, 300, 400, 400],   # 另一个目标
    [103, 102, 212, 208],   # 高度重叠
])
scores = np.array([0.95, 0.88, 0.75, 0.82])

print("检测结果:")
for i, (box, score) in enumerate(zip(boxes, scores)):
    print(f"  Box {i}: {box}, score={score}")

keep = nms(boxes, scores, iou_threshold=0.5)
print(f"\nNMS 后保留的索引: {keep}")
print("说明：重叠度高的冗余框被抑制，保留置信度最高的")

# IoU 示例
iou = compute_iou(boxes[0], boxes[1])
print(f"\nBox 0 和 Box 1 的 IoU: {iou:.3f} (>0.5 → 被抑制)")
