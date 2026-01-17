export type MilestoneStatus = 'unlocked' | 'locked';
export type MilestoneStyle = 'crystal' | 'liquid' | 'orbital';

export interface Milestone {
  id: number;
  title: string;
  status: MilestoneStatus;
  serial?: string;
  rarity?: string;
  mintDate?: string;
  progressText?: string;
  style: MilestoneStyle;
}

export const MILESTONES: Milestone[] = [
  {
    id: 1,
    title: '旅程开始',
    status: 'unlocked',
    serial: 'GSBT-GENESIS-001',
    rarity: 'Alpha',
    mintDate: '2024.03.21',
    progressText: '完成首次铭刻',
    style: 'crystal',
  },
  {
    id: 2,
    title: '深呼吸',
    status: 'unlocked',
    serial: 'GSBT-BREATH-001',
    rarity: 'Kinetic',
    mintDate: '2024.04.12',
    progressText: '累计冥想 60 分钟',
    style: 'liquid',
  },
  {
    id: 3,
    title: '七日觉察',
    status: 'unlocked',
    serial: 'GSBT-AWARE-777',
    rarity: 'Divine',
    mintDate: '2024.05.05',
    progressText: '累计 7 次记录解锁',
    style: 'orbital',
  },
  {
    id: 4,
    title: '???',
    status: 'locked',
    style: 'crystal',
  },
];
