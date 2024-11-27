import type { ExtendedPeer } from '@/utils/webRTC.helpers'

class Connections {
   static map = new Map<string, Map<string, ExtendedPeer>>()

   static getConnections(userId: string) {
      return Connections.map.get(userId)
   }

   static setConnection(
      userId: string,
      connectionId: string,
      connection: ExtendedPeer
   ) {
      if (!Connections.map.has(userId)) {
         Connections.map.set(userId, new Map())
      }
      Connections.map.get(userId)?.set(connectionId, connection)
   }

   static deleteConnection(userId: string, connectionId: string) {
      const userConnections = Connections.map.get(userId)
      if (!userConnections) return
      const connection = userConnections.get(connectionId)
      if (connection) {
         connection.destroy()
      }

      Connections.map.get(userId)?.delete(connectionId)
   }

   static destroyUserConnections(userId: string) {
      const userConnections = Connections.map.get(userId)
      if (!userConnections) return
      for (const [_connectionId, connection] of userConnections) {
         connection.destroy()
      }

      Connections.map.delete(userId)
   }

   static destroyAllConnections() {
      for (const [_userId, userConnections] of Connections.map) {
         for (const [_connectionId, connection] of userConnections) {
            connection.destroy()
         }
      }

      Connections.map.clear()
   }

   static signalConnection(userId: string, connId: string, signal: string) {
      const userConnections = Connections.map.get(userId)
      if (!userConnections) return
      const connection = userConnections.get(connId)
      if (connection) {
         connection.signal(signal)
      }
   }

  static getAllConnectionsToUser(userId: string) {
    const connections = Connections.map.get(userId)
    if (!connections) return []
    return Array.from(connections.values())
  }

  static get length () {
      let count = 0
      for (const [, userConnections] of Connections.map) {
         count += userConnections.size
      }

      return count
  }


}

export default Connections
