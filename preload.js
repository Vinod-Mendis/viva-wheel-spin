const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getItems: () => ipcRenderer.invoke('get-items'),
    getItems2: () => ipcRenderer.invoke('get-items-2'),
    addItem: (itemName, count) => ipcRenderer.invoke('add-item', itemName, count),
    deleteItem: (id) => ipcRenderer.invoke('delete-item', id),
    updateItem: (id, itemName, count) => ipcRenderer.invoke('update-item', id, itemName, count),
    addToTable2: (itemName) => ipcRenderer.invoke('add-to-table2', itemName),
    removeFromTable2: (itemName) => ipcRenderer.invoke('remove-from-table2', itemName),
    onUpdateTable2: (callback) => ipcRenderer.on('update-client-table2', (event, data) => callback(data)),
    deleteItem2: (id) => ipcRenderer.invoke('delete-item-2', id),
    // Listen for real-time updates from the main process
    onItemCountUpdate: (callback) => ipcRenderer.on('item-count-updated', callback),

    // decrementItem: (name) => ipcRenderer.invoke('spin-wheel', name)

    decrementItem: (itemName) => ipcRenderer.invoke("decrement-item", itemName),
  
});
