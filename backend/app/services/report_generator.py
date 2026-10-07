import os
import cv2
import datetime
import numpy as np
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from ..config import REPORT_DIR, UPLOAD_DIR

def create_detection_visualization(
    image_path: str,
    craters: list,
    measurements: list,
    output_vis_path: Path
) -> bool:
    """
    Renders OpenCV visual overlays on the specimen image:
    circular rims, center markers, bounding boxes, labels, and measurement vector lines.
    """
    try:
        raw_img = cv2.imread(str(image_path), cv2.IMREAD_UNCHANGED)
        if raw_img is None:
            return False

        if raw_img.dtype == np.uint16:
            img = cv2.normalize(raw_img, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        elif raw_img.dtype in (np.float32, np.float64):
            img = (raw_img * 255.0).clip(0, 255).astype(np.uint8)
        else:
            img = raw_img.copy()

        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        h, w = img.shape[:2]

        # Draw craters
        for c in craters:
            cx, cy = int(c.get("x", 0)), int(c.get("y", 0))
            r = int(c.get("radius", 15))
            name = c.get("name", "CRATER")
            conf = c.get("confidence", 90.0)

            # Circular crater rim (cyan)
            cv2.circle(img, (cx, cy), r, (255, 229, 0), 2)
            # Center marker crosshair
            cv2.drawMarker(img, (cx, cy), (0, 229, 255), cv2.MARKER_CROSS, 10, 2)
            # Text label
            label = f"{name} ({conf}%)"
            cv2.putText(img, label, (max(5, cx - r), max(18, cy - r - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1, cv2.LINE_AA)

        # Draw primary measurement vector line if available
        if measurements and len(measurements) > 0:
            m = measurements[0]
            c1 = m.get("crater_a_coords", {})
            c2 = m.get("crater_b_coords", {})
            if c1 and c2:
                pt1 = (int(c1.get("x", 0)), int(c1.get("y", 0)))
                pt2 = (int(c2.get("x", 0)), int(c2.get("y", 0)))
                cv2.line(img, pt1, pt2, (0, 255, 0), 2, cv2.LINE_AA)
                mid_x = (pt1[0] + pt2[0]) // 2
                mid_y = (pt1[1] + pt2[1]) // 2
                dist_label = f"{m.get('real_distance_km', 0.0):.2f} KM"
                cv2.putText(img, dist_label, (mid_x - 30, mid_y - 8),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imwrite(str(output_vis_path), img)
        return True
    except Exception as e:
        print(f"Error creating detection visualization: {e}")
        return False

def generate_pdf_report(
    analysis_data: dict,
    user_name: str,
    output_filename: str,
    image_path: str = None
) -> Path:
    """
    Generates a high-precision, aerospace-grade PDF planetary analysis report
    using ReportLab. Includes embedded specimen imagery, detection visualization,
    spatial distance matrix, coordinates table, UN SDG 9 alignment, and scientific disclaimer.
    """
    pdf_path = REPORT_DIR / output_filename
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Aerospace Styles
    title_style = ParagraphStyle(
        'AstroTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0B192C'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'AstroSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#008DDA'),
        spaceAfter=12
    )
    section_heading = ParagraphStyle(
        'AstroSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1E3E62'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'AstroBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#333333')
    )
    disclaimer_style = ParagraphStyle(
        'AstroDisclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#666666')
    )

    story = []

    # Header Banner
    story.append(Paragraph("<b>ASTROSIGHT</b> | PLANETARY SURFACE INTELLIGENCE", title_style))
    story.append(Paragraph("AUTONOMOUS LUNAR & MARTIAN TOPOGRAPHICAL CRATER ANALYSIS REPORT", subtitle_style))
    story.append(Spacer(1, 6))

    # Mission Metadata Grid
    craters = analysis_data.get("craters", [])
    measurements = analysis_data.get("spatial_measurements", [])
    planet = analysis_data.get("planet", "Moon")
    date_str = analysis_data.get("created_at", datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    avg_conf = analysis_data.get("average_confidence", 0.0)
    resolution = analysis_data.get("resolution_m_per_px", 10.0)
    proc_time = analysis_data.get("processing_time_ms", 145)

    meta_data = [
        [
            Paragraph("<b>Analyst / Researcher:</b>", body_style),
            Paragraph(user_name, body_style),
            Paragraph("<b>Target Body:</b>", body_style),
            Paragraph(f"<b>{planet.upper()}</b>", body_style),
        ],
        [
            Paragraph("<b>Timestamp:</b>", body_style),
            Paragraph(str(date_str)[:19], body_style),
            Paragraph("<b>Resolution (GSD):</b>", body_style),
            Paragraph(f"{resolution} m/px", body_style),
        ],
        [
            Paragraph("<b>Validation Status:</b>", body_style),
            Paragraph(f"<font color='#008DDA'><b>{analysis_data.get('validation_state', 'VALID')}</b></font>", body_style),
            Paragraph("<b>Craters Identified:</b>", body_style),
            Paragraph(str(len(craters)), body_style),
        ],
        [
            Paragraph("<b>Model Pipeline:</b>", body_style),
            Paragraph("AstroSight-CraterNet-v2.4", body_style),
            Paragraph("<b>Processing Time:</b>", body_style),
            Paragraph(f"{proc_time} ms", body_style),
        ]
    ]

    meta_table = Table(meta_data, colWidths=[130, 140, 120, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F5F7FA')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Detection Visualization Image Embedding
    vis_path = None
    if image_path and Path(image_path).exists():
        vis_file = REPORT_DIR / f"vis_{Path(output_filename).stem}.png"
        success = create_detection_visualization(image_path, craters, measurements, vis_file)
        if success and vis_file.exists():
            vis_path = vis_file

    if vis_path:
        story.append(Paragraph("1. TOPOGRAPHICAL DETECTION VISUALIZATION", section_heading))
        # Embed image scaled cleanly
        rl_img = RLImage(str(vis_path), width=280, height=210)
        img_table = Table([[rl_img]], colWidths=[540])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#38BDF8')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(img_table)
        story.append(Spacer(1, 8))

    # Craters Coordinate Table
    section_num = 2 if vis_path else 1
    story.append(Paragraph(f"{section_num}. CRATER FEATURE COORDINATES (X, Y)", section_heading))
    if craters:
        crater_table_data = [
            ["ID", "Feature Name", "X (px)", "Y (px)", "Radius (px)", "Diameter (km)", "Confidence"]
        ]
        for c in craters[:12]:
            crater_table_data.append([
                c.get("id", "-"),
                c.get("name", "-"),
                str(c.get("x", "-")),
                str(c.get("y", "-")),
                str(c.get("radius", "-")),
                f"{c.get('diameter_km', 0.0)} km",
                f"{c.get('confidence', 0.0)}%"
            ])
        crater_table = Table(crater_table_data, colWidths=[65, 95, 75, 75, 75, 85, 70])
        crater_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3E62')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7.5),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(crater_table)
    else:
        story.append(Paragraph("<i>No confident crater features were detected on this planetary terrain specimen.</i>", body_style))
    story.append(Spacer(1, 10))

    # Spatial Measurements Table
    section_num += 1
    story.append(Paragraph(f"{section_num}. EUCLIDEAN & REAL-WORLD SPATIAL DISTANCE MATRIX", section_heading))
    if measurements:
        meas_table_data = [
            ["Vector", "Origin Crater", "Target Crater", "Pixel Dist (px)", "Real Distance (m)", "Real Distance (km)"]
        ]
        for idx, m in enumerate(measurements[:8]):
            meas_table_data.append([
                f"VEC-{idx+1:02d}",
                m.get("crater_a_name", "Crater A"),
                m.get("crater_b_name", "Crater B"),
                f"{m.get('pixel_distance', 0.0):.2f} px",
                f"{m.get('real_distance_m', 0.0):.1f} m",
                f"<b>{m.get('real_distance_km', 0.0):.2f} km</b>"
            ])
        meas_table = Table(meas_table_data, colWidths=[60, 100, 100, 95, 95, 90])
        meas_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#008DDA')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7.5),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(meas_table)
    else:
        story.append(Paragraph("<i>No spatial distance vectors calculated for this analysis run.</i>", body_style))
    story.append(Spacer(1, 10))

    # Scientific Disclaimer & UN SDG 9
    section_num += 1
    story.append(Paragraph(f"{section_num}. SCIENTIFIC SPECIFICATIONS & UN SDG 9", section_heading))
    tech_text = (
        "<b>Mathematical Formulation:</b> Planar Euclidean metric d = &radic;((x₂ - x₁)&sup2; + (y₂ - y₁)&sup2;) "
        f"scaled via orthorectified ground sampling distance {resolution} m/px. Real-world distance D = d &times; resolution.<br/>"
        "<b>United Nations SDG 9 Alignment:</b> AstroSight advances UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure) "
        "by establishing open AI infrastructure for planetary remote sensing, crater topology, and deep-space mission research."
    )
    story.append(Paragraph(tech_text, body_style))
    story.append(Spacer(1, 6))

    disclaimer_text = (
        "<b>Scientific Disclaimer:</b> AstroSight automated crater boundary coordinates and distance vectors "
        "are generated for scientific research and mission planning. Topographical scale assumes standard planar projection "
        "for small-area orbital imagery. Always cross-correlate with high-resolution LROC NAC / HiRISE elevation models."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return pdf_path
