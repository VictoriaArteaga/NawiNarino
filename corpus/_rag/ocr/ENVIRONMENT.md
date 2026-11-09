# Entorno y configuración de OCR (2026-11-09)

| Componente | Versión / detalle |
|---|---|
| Tesseract | 5.4.0.20240606 (UB-Mannheim, instalado con `winget install UB-Mannheim.TesseractOCR`), Leptonica 1.84.1, ruta `C:\Program Files\Tesseract-OCR\` |
| Modelos | `tessdata_best` de github.com/tesseract-ocr: `spa.traineddata` (MD5 130215a6355e9ea651f483279271d354), `eng.traineddata` (MD5 4be3f51b55c0074d8c6b1ee5b5100f95); `osd` copiado de la instalación (d7c06843a771f30fb64b4109a1b059f9). Carpeta propia `_rag/ocr/tessdata/` (con `configs/tsv`, `configs/txt`) porque `Program Files` no es escribible sin admin |
| Renderizado de páginas | PyMuPDF 2.1 (MuPDF 1.28.6), instalado con `pip install --user pymupdf`; no hay poppler `pdftoppm` ni Ghostscript |
| Python | 3.12.10 |
| OCRmyPDF | **No instalado.** Requiere Ghostscript además de Tesseract; no hace falta aquí porque no se generan PDF con capa de texto (los originales no se modifican). El OCR se llama directamente con `scripts/ocr_pages.py` |

## Parámetros por documento

| Documento | Idioma | PSM | DPI | Notas |
|---|---|---|---|---|
| Borman (Cofán, 1976) | `spa` | 3 (segmentación automática, 2 columnas) | 300 | No existe modelo para A'ingae; se usa `spa` por el alfabeto latino. Los glotales (') y las vocales/consonantes propias se reconocen solo si Tesseract las parece conocidas: ver evaluación |
| Curnow (Awa Pit, 1997) | `eng` | 4 (una columna, tamaños variables) | 300 | Solo las 198 páginas marcadas `noisy` en `pages.jsonl`. Sin modelo para Awa Pit; los ejemplos en awapit se leen con el modelo inglés |

Opciones comunes: `-c preserve_interword_spaces=1`; salida `txt` + `tsv` (confianza por palabra). `psm 1` no se usa porque exige `osd` y falló con la carpeta de modelos propia. Se registra `mean_conf` (media de confianza por palabra, 0-100) y `low_conf_words` (palabras con confianza < 60).

## Estados del texto OCR

- `_rag/ocr/unreviewed/`: salida directa de Tesseract, sin corregir. Estado `ocr_unreviewed`.
- `_rag/ocr/validated/`: solo páginas cuya transcripción fue comparada manualmente con la imagen. Ver `evaluation.md`.
