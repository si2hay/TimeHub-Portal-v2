/**
 * @file src/features/substitution.logic.js
 * @description Логика наложения замен на базовое расписание.
 * @exports applySubstitutions
 */

export function applySubstitutions(baseLessons, subs) {
    if (!subs || subs.length === 0) return baseLessons;
    let result = JSON.parse(JSON.stringify(baseLessons));

    subs.forEach(sub => {
        const index = result.findIndex(l => l.pair_num === sub.pair_num);
        if (index !== -1) {
            if (!sub.subject || sub.subject.trim() === '') {
                result.splice(index, 1); // Отмена пары
            } else {
                result[index] = { ...sub, is_substitution: true }; // Замена
            }
        } else if (sub.subject && sub.subject.trim() !== '') {
            result.push({ ...sub, is_substitution: true }); // Новая пара вместо отмененной
        }
    });
    return result.sort((a, b) => a.pair_num - b.pair_num);
}