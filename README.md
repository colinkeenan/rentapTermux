# rentapTermux

rentapTermux is rentapBun modified to work with node instead of Bun for use in Termux on an Android device. (Bun can't currently be installed in Termux.) rentapTermux works in Termux for Android with or without a pre-existing store.json. It can use the same store.json created with rentapBun. 

Because Android browsers don't shrink the page width as the user zooms in, there was no way to make rentapTermux display everything in one column as was possible on the desktop just by zooming or making the browser window narrow. So, this version includes a way to force one-column. Begin with `npx tsx ./back.tsx phone& xdg-open http://localhost:3000/` or `npm run-script startphone` to force one column. 
