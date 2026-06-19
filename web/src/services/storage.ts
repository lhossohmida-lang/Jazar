import { IS_DEMO, storage } from '../lib/firebase'

/** رفع صورة منتج وإرجاع رابطها. تجريبياً: تتحول إلى Data URL محلي. */
export async function uploadImage(file: File, path = 'products'): Promise<string> {
  if (IS_DEMO) {
    return await fileToDataUrl(file)
  }
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const name = `${path}/${Date.now()}_${file.name}`
  const r = ref(storage!, name)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
