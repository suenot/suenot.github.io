import type { Locale } from './config';

export const contributions = {
  en: {
    eyebrow: 'contributions', heading: 'Code activity', intro: 'Yearly contribution activity across GitHub and GitLab.',
    loading: 'Loading contribution activity…', unavailable: 'Contribution activity is unavailable right now.', partial: 'Some sources are unavailable; available activity is shown.',
    range: 'Range', updated: 'Updated', combined: 'Combined daily activity', privateNote: 'Includes accessible private activity as aggregate counts. GitHub and GitLab totals remain separate and are not deduplicated.', sourceNote: 'GitHub counts follow GitHub contribution rules. GitLab counts activity events; one push counts as one event regardless of commit count.',
    details: 'Daily activity details', date: 'Date', activity: 'Contributions', unavailableSource: 'unavailable', noActivity: 'No recorded activity in this range.',
  },
  ru: {
    eyebrow: 'вклад', heading: 'Активность в коде', intro: 'Годовая активность на GitHub и GitLab.',
    loading: 'Загрузка активности…', unavailable: 'Данные об активности сейчас недоступны.', partial: 'Часть источников недоступна; показана доступная активность.',
    range: 'Период', updated: 'Обновлено', combined: 'Суммарная активность по дням', privateNote: 'Включает доступную приватную активность в виде агрегированных значений. Итоги GitHub и GitLab показаны отдельно и не очищены от повторов.', sourceNote: 'GitHub учитывает вклад по правилам GitHub. GitLab учитывает события активности: один push считается одним событием независимо от числа коммитов.',
    details: 'Активность по дням', date: 'Дата', activity: 'Вклад', unavailableSource: 'недоступен', noActivity: 'За этот период активности не найдено.',
  },
  zh: {
    eyebrow: '贡献', heading: '代码活动', intro: 'GitHub 和 GitLab 的年度贡献活动。',
    loading: '正在加载贡献活动…', unavailable: '贡献活动暂时不可用。', partial: '部分来源不可用，已显示可用活动。',
    range: '日期范围', updated: '更新时间', combined: '合并后的每日活动', privateNote: '包含可访问的私有活动汇总计数。GitHub 和 GitLab 总数分别显示，未跨平台去重。', sourceNote: 'GitHub 计数遵循 GitHub 的贡献规则。GitLab 计入活动事件；一次推送无论包含多少次提交都只算一个事件。',
    details: '每日活动详情', date: '日期', activity: '贡献', unavailableSource: '不可用', noActivity: '此日期范围内没有记录的活动。',
  },
  ko: {
    eyebrow: '기여', heading: '코드 활동', intro: 'GitHub과 GitLab의 연간 기여 활동입니다.',
    loading: '기여 활동을 불러오는 중…', unavailable: '현재 기여 활동을 불러올 수 없습니다.', partial: '일부 소스를 사용할 수 없어 이용 가능한 활동만 표시합니다.',
    range: '기간', updated: '업데이트', combined: '일별 통합 활동', privateNote: '접근 가능한 비공개 활동을 집계값으로 포함합니다. GitHub과 GitLab 합계는 별도로 표시되며 플랫폼 간 중복 제거를 하지 않습니다.', sourceNote: 'GitHub 집계는 GitHub 기여 규칙을 따릅니다. GitLab은 활동 이벤트를 집계하며, 푸시 한 번은 커밋 수와 관계없이 하나의 이벤트입니다.',
    details: '일별 활동 세부 정보', date: '날짜', activity: '기여', unavailableSource: '사용 불가', noActivity: '이 기간에 기록된 활동이 없습니다.',
  },
  ja: {
    eyebrow: 'コントリビューション', heading: 'コード活動', intro: 'GitHub と GitLab の年間コントリビューション活動。',
    loading: 'コントリビューション活動を読み込み中…', unavailable: '現在、コントリビューション活動を取得できません。', partial: '一部のソースを利用できないため、取得できた活動を表示しています。',
    range: '期間', updated: '更新', combined: '日別の統合活動', privateNote: 'アクセス可能な非公開活動を集計値として含みます。GitHub と GitLab の合計は別々に表示し、プラットフォーム間の重複排除は行いません。', sourceNote: 'GitHub の集計は GitHub のコントリビューション規則に従います。GitLab は活動イベントを集計し、1 回の push はコミット数に関係なく 1 イベントです。',
    details: '日別活動の詳細', date: '日付', activity: 'コントリビューション', unavailableSource: '利用不可', noActivity: 'この期間に記録された活動はありません。',
  },
  ar: {
    eyebrow: 'المساهمات', heading: 'نشاط البرمجة', intro: 'نشاط المساهمات السنوي على GitHub وGitLab.',
    loading: 'جار تحميل نشاط المساهمات…', unavailable: 'نشاط المساهمات غير متاح حاليا.', partial: 'بعض المصادر غير متاحة؛ يظهر النشاط المتاح.',
    range: 'الفترة', updated: 'آخر تحديث', combined: 'النشاط اليومي المجمّع', privateNote: 'يتضمن النشاط الخاص المتاح كقيم مجمعة. تظهر إجماليات GitHub وGitLab منفصلة ولا تزال غير مزالة التكرار بين المنصتين.', sourceNote: 'تتبع أرقام GitHub قواعد مساهمات GitHub. يحسب GitLab أحداث النشاط؛ وكل push يعد حدثا واحدا مهما كان عدد الالتزامات.',
    details: 'تفاصيل النشاط اليومي', date: 'التاريخ', activity: 'المساهمات', unavailableSource: 'غير متاح', noActivity: 'لا يوجد نشاط مسجل في هذه الفترة.',
  },
} as const;

export function getContributions(locale: Locale) {
  return contributions[locale] ?? contributions.en;
}
