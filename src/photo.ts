export const PHOTO_MAX_BYTES = 15 * 1024 * 1024
export const PHOTO_MAX_PIXELS = 80_000_000
export const PHOTO_EDIT_MAX_SIDE = 4096
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type PhotoAdjustments = {
  zoom: number
  focalX: number
  focalY: number
  darkness: number
  gradient: number
}

export type PhotoPlacement = {
  width: number
  height: number
  left: number
  top: number
}

export type PhotoAsset = {
  name: string
  url: string
  source: CanvasImageSource
  width: number
  height: number
  originalWidth: number
  originalHeight: number
}

export const defaultPhotoAdjustments: PhotoAdjustments = {
  zoom: 1,
  focalX: .5,
  focalY: .5,
  darkness: .18,
  gradient: .55,
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizePhotoAdjustments(adjustments: PhotoAdjustments): PhotoAdjustments {
  return {
    zoom: clamp(adjustments.zoom, 1, 3),
    focalX: clamp(adjustments.focalX, 0, 1),
    focalY: clamp(adjustments.focalY, 0, 1),
    darkness: clamp(adjustments.darkness, 0, .65),
    gradient: clamp(adjustments.gradient, 0, .8),
  }
}

export function calculatePhotoPlacement(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  adjustments: PhotoAdjustments,
): PhotoPlacement {
  if ([sourceWidth, sourceHeight, targetWidth, targetHeight].some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error('As dimensões da fotografia ou da composição são inválidas.')
  }

  const normalized = normalizePhotoAdjustments(adjustments)
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight) * normalized.zoom
  const width = sourceWidth * scale
  const height = sourceHeight * scale
  const overflowX = Math.max(0, width - targetWidth)
  const overflowY = Math.max(0, height - targetHeight)

  return {
    width,
    height,
    left: -overflowX * normalized.focalX,
    top: -overflowY * normalized.focalY,
  }
}

export function photoPlacementStyle(placement: PhotoPlacement, targetWidth: number, targetHeight: number): Record<string, string> {
  return {
    width: `${placement.width / targetWidth * 100}%`,
    height: `${placement.height / targetHeight * 100}%`,
    left: `${placement.left / targetWidth * 100}%`,
    top: `${placement.top / targetHeight * 100}%`,
  }
}

export function validatePhotoFile(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  const extension = file.name.split('.').at(-1)?.toLowerCase()
  if (extension === 'heic' || extension === 'heif' || file.type.includes('heic') || file.type.includes('heif')) {
    return 'Fotos HEIC/HEIF ainda não são compatíveis. Converta a imagem para JPEG, PNG ou WebP.'
  }
  if (!(PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Formato incompatível. Escolha uma fotografia JPEG, PNG ou WebP; arquivos SVG não são aceitos.'
  }
  if (file.size <= 0) return 'O arquivo selecionado está vazio.'
  if (file.size > PHOTO_MAX_BYTES) return 'A fotografia excede o limite de 15 MB.'
  return null
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('O navegador não conseguiu decodificar esta fotografia.'))
    image.src = url
  })
}

function createBitmapPreviewUrl(bitmap: ImageBitmap): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Canvas 2D indisponível para reduzir a fotografia.'))
  context.drawImage(bitmap, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob))
      else reject(new Error('Não foi possível preparar a prévia reduzida da fotografia.'))
    }, 'image/jpeg', .9)
  })
}

export async function loadPhotoAsset(file: File): Promise<PhotoAsset> {
  const validationError = validatePhotoFile(file)
  if (validationError) throw new Error(validationError)

  let url = URL.createObjectURL(file)
  try {
    if (typeof createImageBitmap === 'function') {
      let bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      const originalWidth = bitmap.width
      const originalHeight = bitmap.height
      if (originalWidth * originalHeight > PHOTO_MAX_PIXELS) {
        bitmap.close()
        throw new Error('A fotografia excede o limite de 80 megapixels.')
      }

      const longestSide = Math.max(originalWidth, originalHeight)
      if (longestSide > PHOTO_EDIT_MAX_SIDE) {
        const ratio = PHOTO_EDIT_MAX_SIDE / longestSide
        const resized = await createImageBitmap(bitmap, {
          resizeWidth: Math.round(originalWidth * ratio),
          resizeHeight: Math.round(originalHeight * ratio),
          resizeQuality: 'high',
        })
        bitmap.close()
        bitmap = resized
        try {
          const reducedUrl = await createBitmapPreviewUrl(bitmap)
          URL.revokeObjectURL(url)
          url = reducedUrl
        } catch (error) {
          bitmap.close()
          throw error
        }
      }

      return {
        name: file.name,
        url,
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        originalWidth,
        originalHeight,
      }
    }

    const image = await loadHtmlImage(url)
    if (image.naturalWidth * image.naturalHeight > PHOTO_MAX_PIXELS) {
      throw new Error('A fotografia excede o limite de 80 megapixels.')
    }
    return {
      name: file.name,
      url,
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    if (error instanceof Error) throw error
    throw new Error('Não foi possível processar esta fotografia.')
  }
}

export function releasePhotoAsset(asset: PhotoAsset | null): void {
  if (!asset) return
  URL.revokeObjectURL(asset.url)
  if (typeof ImageBitmap !== 'undefined' && asset.source instanceof ImageBitmap) asset.source.close()
}
