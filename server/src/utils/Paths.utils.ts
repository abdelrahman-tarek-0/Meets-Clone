import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const currentPath = (importMetaUrl: string) => {
   if (importMetaUrl) {
      return path.dirname(fileURLToPath(importMetaUrl))
   }

   return path.dirname(fileURLToPath(import.meta.url))
}

const dirName = currentPath(import.meta.url)

class Paths {
   static root = (...trail: string[]) =>
      path.resolve(path.join(dirName, '..', '..', ...trail))

   static src = (...trail: string[]) => Paths.root('src', ...trail)

   static current = (importMetaUrl: string, ...trail: string[]) =>
      path.join(currentPath(importMetaUrl), ...trail)

   static public = (...trail: string[]) => Paths.root('public', ...trail)
   static relative = (...trail: string[]) => path.resolve(dirName, ...trail)

   static isPathExists = async (path: string) => {
      try {
         await fs.access(path)
         return true
      } catch {
         return false
      }
   }

   static initPaths = async (paths: string[] = []) => {
      for (const p of paths) {
         await Paths.createIfNotExists(p)
      }
   }

   static createDirectory = async (path: string) => {
      try {
         await fs.mkdir(path, { recursive: true })
         return path
      } catch {
         return false
      }
   }
   static createIfNotExists = async (path: string) => {
      const exists = await Paths.isPathExists(path)
      if (!exists) {
         return await Paths.createDirectory(path)
      }
      return path
   }
   static deleteFile = async (path: string) => {
      try {
         await fs.unlink(path)
         return true
      } catch {
         return false
      }
   }
   static deletePublic = async (...tail: string[]) => {
      const path = Paths.public(...tail)
      return await Paths.deleteFile(path)
   }
   static join = (...trail: string[]) => path.join(...trail)
   static isSame = (path1: string, path2: string) => {
      try {
         return path.relative(path1, path2) === ''
      } catch {
         return false
      }
   }

   constructor() {
      throw new Error('Paths is a utility class and cannot be instantiated')
   }
}

export default Paths
