import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  calculatePhotoPlacement,
  defaultPhotoAdjustments,
  normalizePhotoAdjustments,
  PHOTO_MAX_BYTES,
  validatePhotoFile,
} from './photo.ts'

describe('validação de fotografias', () => {
  it('aceita JPEG, PNG e WebP dentro do limite', () => {
    for (const [name, type] of [['foto.jpg', 'image/jpeg'], ['foto.png', 'image/png'], ['foto.webp', 'image/webp']]) {
      assert.equal(validatePhotoFile({ name, type, size: 1024 }), null)
    }
  })

  it('recusa SVG, HEIC, arquivo vazio e arquivo acima de 15 MB', () => {
    assert.match(validatePhotoFile({ name: 'foto.svg', type: 'image/svg+xml', size: 100 }) ?? '', /SVG/)
    assert.match(validatePhotoFile({ name: 'foto.heic', type: 'image/heic', size: 100 }) ?? '', /HEIC/)
    assert.match(validatePhotoFile({ name: 'foto.jpg', type: 'image/jpeg', size: 0 }) ?? '', /vazio/)
    assert.match(validatePhotoFile({ name: 'foto.jpg', type: 'image/jpeg', size: PHOTO_MAX_BYTES + 1 }) ?? '', /15 MB/)
  })
})

describe('enquadramento normalizado', () => {
  it('preenche Story com foto horizontal sem distorcer', () => {
    const placement = calculatePhotoPlacement(1600, 900, 1080, 1920, defaultPhotoAdjustments)
    assert.equal(placement.height, 1920)
    assert.ok(Math.abs(placement.width / placement.height - 1600 / 900) < 1e-12)
    assert.ok(Math.abs(placement.top) < 1e-12)
    assert.ok(placement.left < 0)
  })

  it('preenche Feed com foto vertical e respeita o foco', () => {
    const left = calculatePhotoPlacement(900, 1600, 1080, 1350, { ...defaultPhotoAdjustments, focalY: 0 })
    const right = calculatePhotoPlacement(900, 1600, 1080, 1350, { ...defaultPhotoAdjustments, focalY: 1 })
    assert.equal(left.width, 1080)
    assert.ok(Math.abs(left.top) < 1e-12)
    assert.ok(right.top < left.top)
    assert.ok(Math.abs(left.width / left.height - 900 / 1600) < 1e-12)
  })

  it('limita zoom, foco e contraste aos intervalos seguros', () => {
    assert.deepEqual(normalizePhotoAdjustments({ zoom: 9, focalX: -2, focalY: 4, darkness: 2, gradient: -1 }), {
      zoom: 3,
      focalX: 0,
      focalY: 1,
      darkness: .65,
      gradient: 0,
    })
  })

  it('zoom aumenta a imagem sem criar áreas descobertas', () => {
    const normal = calculatePhotoPlacement(1600, 900, 1080, 1920, defaultPhotoAdjustments)
    const zoomed = calculatePhotoPlacement(1600, 900, 1080, 1920, { ...defaultPhotoAdjustments, zoom: 2 })
    assert.equal(zoomed.width, normal.width * 2)
    assert.equal(zoomed.height, normal.height * 2)
    assert.ok(zoomed.left <= 0 && zoomed.top <= 0)
  })
})
