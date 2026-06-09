import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TriangleAlert } from 'lucide-react';
import { useColoresCatalog } from '@/hooks/use-colores';

interface PropTypes {
  data: IEmotionBarChart[];
  colors?: {
    positives?: string;
    neutrals?: string;
    negatives?: string;
  };
}

const DEFAULT_EMOTION_COLOR = '#6c757d';

export function BarEmotionChart({ data }: Readonly<PropTypes>) {
  const [excluded, setExcluded] = React.useState<string[]>([]);
  const { getColor } = useColoresCatalog();

  const getEmotionColor = (emotionName: string): string => {
    return getColor('emociones', emotionName, DEFAULT_EMOTION_COLOR);
  };

  const emotions = useMemo(() => {
    return data.filter((emotion) => !excluded.includes(emotion.nombre));
  }, [data, excluded]);

  const toggleEmotion = (emotion: string) => {
    setExcluded((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          color: '#000',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <ul style={{ margin: 0, paddingLeft: '10px' }}>
          {payload.map((entry: any, index: number) => (
            <li
              key={index}
              style={{
                listStyle: 'none',
                color: '#000',
                textTransform: 'capitalize',
                fontSize: '0.9rem',
                marginTop: '4px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: entry.color,
                  borderRadius: '2px',
                  marginRight: '6px',
                }}
              />
              {`${entry.name}: `}
              <strong>{entry.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const emotionSeriesColor = (emotion: { nombre: string }) => getEmotionColor(emotion.nombre);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {data.map((emotion) => (
          <Badge
            key={emotion.nombre}
            className={`cursor-pointer capitalize ${!excluded.includes(emotion.nombre)
              ? ''
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            onClick={() => toggleEmotion(emotion.nombre)}
          >
            {emotion.nombre}
          </Badge>
        ))}
      </div>

      {(data.length === excluded.length) ? (
        <div className='h-64 w-full flex flex-col items-center justify-center p-4 text-red-800 text-center rounded-lg bg-red-50'>
          <TriangleAlert className="block mb-4" />
          <p>No tiene emociones seleccionadas</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={emotions}
              margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
              maxBarSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip content={renderTooltip} />
              <Bar dataKey="positivos" radius={[4, 4, 0, 0]}>
                {emotions.map((entry) => (
                  <Cell key={`cell-${entry.nombre}-p`} fill={emotionSeriesColor(entry)} />
                ))}
                <LabelList dataKey="positivos" position="top" formatter={() => 'Pos'} />
              </Bar>
              <Bar dataKey="neutrales" radius={[4, 4, 0, 0]}>
                {emotions.map((entry) => (
                  <Cell key={`cell-${entry.nombre}-n`} fill={emotionSeriesColor(entry)} />
                ))}
                <LabelList dataKey="neutrales" position="top" formatter={() => 'Neu'} />
              </Bar>
              <Bar dataKey="negativos" radius={[4, 4, 0, 0]}>
                {emotions.map((entry) => (
                  <Cell key={`cell-${entry.nombre}-ng`} fill={emotionSeriesColor(entry)} />
                ))}
                <LabelList dataKey="negativos" position="top" formatter={() => 'Neg'} />
              </Bar>
            </BarChart>
          </ResponsiveContainer >
        </div>
      )}

    </div>
  );
}
