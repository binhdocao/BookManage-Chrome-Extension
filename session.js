//Binh Do-Cao
//Session.js



export async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password); // Combine salt and password
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const salt = crypto.getRandomValues(new Uint8Array(16)).join('');
