#!/usr/bin/env swift

import AppKit
import Foundation

let arguments = CommandLine.arguments
guard arguments.count == 3 else {
  fputs("Usage: generate-og.swift <background.png> <output.png>\n", stderr)
  exit(2)
}

let inputURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2])
guard let background = NSImage(contentsOf: inputURL) else {
  fputs("Could not load background image.\n", stderr)
  exit(3)
}

let width: CGFloat = 1200
let height: CGFloat = 628
guard
  let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(width),
    pixelsHigh: Int(height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ),
  let graphics = NSGraphicsContext(bitmapImageRep: bitmap)
else {
  fputs("Could not create social card canvas.\n", stderr)
  exit(4)
}

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(srgbRed: red / 255, green: green / 255, blue: blue / 255, alpha: alpha)
}

func drawText(_ text: String, at point: NSPoint, font: NSFont, color textColor: NSColor, tracking: CGFloat = 0) {
  let paragraph = NSMutableParagraphStyle()
  paragraph.lineBreakMode = .byClipping
  let attributes: [NSAttributedString.Key: Any] = [
    .font: font,
    .foregroundColor: textColor,
    .kern: tracking,
    .paragraphStyle: paragraph
  ]
  (text as NSString).draw(at: point, withAttributes: attributes)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = graphics

color(6, 7, 11).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: height)).fill()

let sourceSize = background.size
let targetAspect = width / height
let sourceAspect = sourceSize.width / sourceSize.height
var sourceRect = NSRect(origin: .zero, size: sourceSize)
if sourceAspect > targetAspect {
  let cropWidth = sourceSize.height * targetAspect
  sourceRect.origin.x = (sourceSize.width - cropWidth) / 2
  sourceRect.size.width = cropWidth
} else {
  let cropHeight = sourceSize.width / targetAspect
  sourceRect.origin.y = (sourceSize.height - cropHeight) / 2
  sourceRect.size.height = cropHeight
}
background.draw(
  in: NSRect(x: 0, y: 0, width: width, height: height),
  from: sourceRect,
  operation: .sourceOver,
  fraction: 1,
  respectFlipped: true,
  hints: [.interpolation: NSImageInterpolation.high]
)

if let shade = NSGradient(colors: [color(3, 4, 8, 0.36), color(3, 4, 8, 0.04)]) {
  shade.draw(in: NSRect(x: 0, y: 0, width: 760, height: height), angle: 0)
}

for x in stride(from: CGFloat(0), through: CGFloat(640), by: CGFloat(80)) {
  color(167, 139, 250, 0.045).setStroke()
  let path = NSBezierPath()
  path.lineWidth = 1
  path.move(to: NSPoint(x: x, y: 0))
  path.line(to: NSPoint(x: x, y: height))
  path.stroke()
}
for y in stride(from: CGFloat(0), through: height, by: CGFloat(80)) {
  color(103, 232, 249, 0.035).setStroke()
  let path = NSBezierPath()
  path.lineWidth = 1
  path.move(to: NSPoint(x: 0, y: y))
  path.line(to: NSPoint(x: 640, y: y))
  path.stroke()
}

let frame = NSBezierPath(roundedRect: NSRect(x: 28, y: 28, width: 1144, height: 572), xRadius: 25, yRadius: 25)
frame.lineWidth = 1
color(211, 220, 255, 0.17).setStroke()
frame.stroke()

let pill = NSBezierPath(roundedRect: NSRect(x: 68, y: 518, width: 293, height: 38), xRadius: 19, yRadius: 19)
color(7, 18, 20, 0.76).setFill()
pill.fill()
pill.lineWidth = 1
color(94, 234, 212, 0.28).setStroke()
pill.stroke()

let statusDot = NSBezierPath(ovalIn: NSRect(x: 85, y: 533, width: 8, height: 8))
color(94, 234, 212).setFill()
statusDot.fill()
drawText(
  "INTELLIGENT SYSTEMS ONLINE",
  at: NSPoint(x: 105, y: 527),
  font: NSFont.systemFont(ofSize: 12, weight: .bold),
  color: color(167, 243, 230),
  tracking: 1.6
)

drawText(
  "Saboor",
  at: NSPoint(x: 67, y: 364),
  font: NSFont.systemFont(ofSize: 88, weight: .heavy),
  color: color(244, 246, 255),
  tracking: -4.3
)

let serif = NSFont(name: "Georgia-Italic", size: 84) ?? NSFont.systemFont(ofSize: 84, weight: .regular)
drawText(
  "Siddiqui.",
  at: NSPoint(x: 68, y: 274),
  font: serif,
  color: color(196, 181, 253),
  tracking: -3.1
)

drawText(
  "DATA ENGINEER III  ·  AGENTIC AI BUILDER",
  at: NSPoint(x: 70, y: 218),
  font: NSFont.systemFont(ofSize: 16, weight: .semibold),
  color: color(203, 211, 231),
  tracking: 0.8
)

if let rule = NSGradient(colors: [color(167, 139, 250), color(103, 232, 249)]) {
  rule.draw(in: NSRect(x: 70, y: 190, width: 112, height: 2), angle: 0)
}

drawText(
  "DATA ENGINEERING   ·   AI AGENTS   ·   CLOUD SCALE",
  at: NSPoint(x: 70, y: 62),
  font: NSFont.systemFont(ofSize: 11, weight: .bold),
  color: color(137, 148, 175),
  tracking: 1.35
)

NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
  fputs("Could not encode social card.\n", stderr)
  exit(4)
}

try png.write(to: outputURL, options: .atomic)
print("Wrote \(outputURL.path)")
