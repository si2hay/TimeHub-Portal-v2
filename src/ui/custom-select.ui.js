/**
 * @file src/ui/custom-select.ui.js
 * @description Кастомный выпадающий список с умным поиском.
 */
import { smartSearch } from '../features/search.logic.js';

export function createSearchableSelect(options, currentValue, placeholder, hiddenSelectId, onSelect = null) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';

    // Скрытый select для совместимости
    const hiddenSelect = document.createElement('select');
    hiddenSelect.id = hiddenSelectId;
    hiddenSelect.style.display = 'none';
    hiddenSelect.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join('');
    hiddenSelect.value = currentValue || options[0];
    wrapper.appendChild(hiddenSelect);

    const uiDiv = document.createElement('div');
    uiDiv.innerHTML = `
        <div class="custom-capsule" tabindex="0">
            <span class="capsule-text ${currentValue ? '' : 'placeholder'}">${currentValue || placeholder}</span>
            <span class="arrow">▼</span>
        </div>
        <div class="custom-dropdown">
            <div class="dropdown-search-wrapper">
                <input type="text" class="dropdown-search" placeholder="🔍 Умный поиск..." autocomplete="off">
            </div>
            <div class="custom-options"></div>
        </div>
    `;
    wrapper.appendChild(uiDiv);

    const capsule = wrapper.querySelector('.custom-capsule');
    const capsuleText = wrapper.querySelector('.capsule-text');
    const dropdown = wrapper.querySelector('.custom-dropdown');
    const searchInput = wrapper.querySelector('.dropdown-search');
    const optionsContainer = wrapper.querySelector('.custom-options');
    let selectedValue = hiddenSelect.value;

    // Включаем видимость для родительских аккордеонов, чтобы список не обрезался
    const toggleParentStyles = (isOpen) => {
        let el = wrapper.parentElement;
        while (el) {
            if (el.classList.contains('settings-group')) {
                el.classList.toggle('allow-overflow', isOpen);
            }
            if (el.classList.contains('settings-inner') || el.classList.contains('settings-content')) {
                el.classList.toggle('allow-overflow', isOpen);
            }
            el = el.parentElement;
        }
    };

    const renderOptions = (query = '') => {
        const filtered = smartSearch(options, query);
        
        if (filtered.length === 0) {
            optionsContainer.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }
        optionsContainer.innerHTML = filtered.map(opt => `
            <div class="custom-option ${opt === selectedValue ? 'selected' : ''}" data-value="${opt}">${opt}</div>
        `).join('');

        optionsContainer.querySelectorAll('.custom-option').forEach(el => {
            el.addEventListener('click', () => {
                selectedValue = el.dataset.value;
                capsuleText.textContent = selectedValue;
                capsuleText.classList.remove('placeholder');
                hiddenSelect.value = selectedValue;
                closeDropdown();
                searchInput.value = '';
                renderOptions();
                if (onSelect) onSelect(selectedValue);
            });
        });
    };

    const openDropdown = () => {
        // Закрываем другие дропдауны
        document.querySelectorAll('.custom-dropdown.open').forEach(d => {
            d.classList.remove('open');
            d.closest('.custom-select-wrapper')?.classList.remove('open');
            let parent = d.parentElement;
            while (parent) {
                if (parent.classList.contains('settings-group') || parent.classList.contains('settings-inner') || parent.classList.contains('settings-content')) {
                    parent.classList.remove('allow-overflow');
                }
                parent = parent.parentElement;
            }
        });

        dropdown.classList.add('open');
        wrapper.classList.add('open');
        toggleParentStyles(true);
        
        // ФИКС: На мобилках не открываем клавиатуру автоматически (чтобы не дёргалось)
        // На ПК фокусим, но с preventScroll (чтобы не сдвигался контент)
        const isMobile = window.matchMedia('(pointer: coarse)').matches;
        if (!isMobile) {
            searchInput.focus({ preventScroll: true });
        }
        
        renderOptions();
    };

    const closeDropdown = () => {
        dropdown.classList.remove('open');
        wrapper.classList.remove('open');
        toggleParentStyles(false);
    };

    capsule.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains('open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    searchInput.addEventListener('input', (e) => renderOptions(e.target.value));

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    renderOptions();
    return wrapper;
}