export function cropMonitoring(duration: number) {
  if (!Number.isInteger(duration) || duration < 1) return [];
  const tasks = [{ day: '১', task: 'বীজ বপন/রোপণের দিন নথিভুক্ত করুন', icon: 'Sprout', color: 'text-secondary', done: false }];
  for (let day = 7; day < duration; day += 7) {
    tasks.push({ day: day.toLocaleString('bn-BD', { useGrouping: false }), task: 'ফসল, আগাছা, পোকা ও মাটির আর্দ্রতা পর্যবেক্ষণ', icon: 'Bug', color: 'text-primary', done: false });
  }
  tasks.push({ day: duration.toLocaleString('bn-BD', { useGrouping: false }), task: 'ফসলের পরিপক্বতা দেখে সংগ্রহের সময় নিশ্চিত করুন', icon: 'Scissors', color: 'text-secondary', done: false });
  return tasks;
}