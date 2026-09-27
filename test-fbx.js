import fs from 'fs';
// We need to inspect the FBX. Since fflate and three are installed, we can try to run a node script using three.
// But three's FBXLoader requires DOM (window, document, Image, etc).
// We can just log it inside the React app.
