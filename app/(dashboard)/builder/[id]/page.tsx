import { Designer } from "@/components/builder/Designer";
import { FormElementInstance } from "@/components/builder/types";

const mockElements: FormElementInstance[] = [
  {
    id: "field-1",
    type: "TextField",
    extraAttributes: {
      label: "Ваше имя",
      placeholder: "Иван Иванов",
      required: true,
    },
  },
  {
    id: "field-2",
    type: "SelectField",
    extraAttributes: {
      label: "Выберите город",
      required: false,
      options: ["Москва", "Санкт-Петербург", "Казань"],
    },
  },
];

export default function BuilderPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Редактирование: Моя первая форма
        </h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition">
            Превью
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Сохранить
          </button>
        </div>
      </header>
      <div className="flex-1 w-full h-full overflow-hidden">
        <Designer initialElements={mockElements} />
      </div>
    </div>
  );
}