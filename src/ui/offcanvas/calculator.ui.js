/**
 * @file src/ui/offcanvas/calculator.ui.js
 * @description Калькулятор оценок (внутри off-canvas меню).
 */

export function renderCalculator() {
    const calcContainer = document.createElement('div');
    calcContainer.innerHTML = `
        <div class="calc-display" id="calc-display"><span class="calc-placeholder">Введи оценки</span></div>
        <div class="calc-result" id="calc-result">Средний балл: -</div>
        <div class="calc-keyboard">
            <button class="calc-btn" data-val="5">5</button>
            <button class="calc-btn" data-val="4">4</button>
            <button class="calc-btn" data-val="3">3</button>
            <button class="calc-btn" data-val="2">2</button>
            <button class="calc-btn" data-val="1">1</button>
            <button class="calc-btn calc-btn-action" id="calc-back">⌫</button>
            <button class="calc-btn calc-btn-bad" data-val="22222">22222</button>
            <button class="calc-btn calc-btn-action calc-btn-wide" id="calc-clear" style="grid-column: span 2;">Сброс</button>
        </div>
    `;

    let calcValue = '';
    let popAnim = null;
    const display = calcContainer.querySelector('#calc-display');
    const result = calcContainer.querySelector('#calc-result');

    const updateCalc = () => {
        if (calcValue) {
            display.innerHTML = `<span class="calc-numbers">${calcValue}</span>`;
            display.classList.remove('empty');
        } else {
            display.innerHTML = `<span class="calc-placeholder">Введи оценки</span>`;
            display.classList.add('empty');
        }

        if (popAnim) popAnim.cancel();
        popAnim = display.animate(
            [
                { transform: 'scale(1)' },
                { transform: 'scale(1.02)' },
                { transform: 'scale(1)' }
            ],
            { duration: 200, easing: 'ease-out' }
        );
        
        const matches = calcValue.match(/[1-5]/g);
        if (!matches || matches.length === 0) { 
            result.textContent = 'Средний балл: -'; 
            result.classList.remove('has-value');
            return; 
        }
        
        const grades = matches.map(Number);
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        result.textContent = `Средний балл: ${avg.toFixed(2)}`;
        result.classList.add('has-value');
    };

    calcContainer.querySelectorAll('.calc-btn[data-val]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (calcValue.length < 40) { calcValue += btn.dataset.val; updateCalc(); }
        });
    });
    calcContainer.querySelector('#calc-back').addEventListener('click', () => { calcValue = calcValue.slice(0, -1); updateCalc(); });
    calcContainer.querySelector('#calc-clear').addEventListener('click', () => { calcValue = ''; updateCalc(); });

    return calcContainer;
}