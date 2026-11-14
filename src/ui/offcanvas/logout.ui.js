/**
 * @file src/ui/offcanvas/logout.ui.js
 * @description Логика кнопки выхода с удержанием (3 секунды).
 */
import { supabase } from '../../api/supabase-client.js';
import { setupHoldButton } from '../utils/hold-button.ui.js';

export function setupHoldLogout(btn, baseUrl) {
    setupHoldButton(btn, async () => {
        await supabase.auth.signOut();
        window.location.href = `${baseUrl}index.html`;
    }, 3000);
}