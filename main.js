const { app, BrowserWindow, ipcMain } = require('electron');
const electronReload = require('electron-reload')
const path = require('path');
const db = require('./database');

let adminWindow, clientWindow;

function createWindows() {
    adminWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    clientWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    adminWindow.loadFile('admin.html');
    clientWindow.loadFile('wheel.html');
}

// Open windows when the app is ready
app.whenReady().then(() => {
    createWindows();
    db.initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-items', async () => {
    return db.getItems();
});

ipcMain.handle('get-items-2', async () => {
    return db.getTable2Items();
});


ipcMain.handle('add-item', async (event, itemName, count,  itemImageBuffer) => {
    const d = new Date();
    const itemId = d.getTime();
    const imagePath = path.join(__dirname, 'images', `${itemId}.png`);

    // Save image if available
    if (itemImageBuffer) {
        fs.writeFileSync(imagePath, Buffer.from(itemImageBuffer));
    }

    return db.addItem(itemName, count, imagePath);
});

ipcMain.handle('delete-item', async (event, id) => {
    return db.deleteItem(id);
});

ipcMain.handle('update-item', async (event, id, itemName, count) => {
    return db.updateItem(id, itemName, count);
});

ipcMain.handle('add-to-table2', async (event, itemName) => {
    db.addToTable2(itemName);
    clientWindow.webContents.send('update-client-table2', await db.getTable2Items());
});

ipcMain.handle('remove-from-table2', async (event, itemName) => {
    db.removeFromTable2(itemName);
    clientWindow.webContents.send('update-client-table2', await db.getTable2Items());
});

ipcMain.handle('delete-item-2', async (event, id) => {
    return db.deleteItem2(id);
});


ipcMain.handle('spin-wheel', async (name) => {
    await db.decrementPrizeStock(name);
    return;
 });


 ipcMain.handle("decrement-item", async (event, itemName) => {
    try {
      const result = await db.decrementItem(itemName); // Call the database decrement function
      if (result) {
        // Send the updated items list to all renderer processes
    BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('item-count-updated', itemName);
    });
        return { success: true };
      } else {
        return { success: false, error: "Failed to update item count" };
      }
    } catch (error) {
      console.error("Database decrement error:", error);
      return { success: false, error: error.message };
    }
  });
