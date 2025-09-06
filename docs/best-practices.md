# Reglamento de Desarrollo

Este reglamento establece lineamientos y buenas prácticas para el desarrollo de aplicaciones en React.  
El objetivo es mantener la coherencia del código, facilitar la colaboración entre equipos y asegurar un producto más mantenible y eficiente.

---

## Manejo de Formularios

Para la gestión de formularios se debe utilizar [React Hook Form](https://react-hook-form.com/get-started).  
Con esta librería es posible manejar de forma eficiente acciones del usuario, tales como:

- Verificar si el formulario se encuentra en proceso de envío.
- Identificar si el formulario presenta errores de validación.
- Detectar si el formulario ha sido accionado por el usuario.

Entre otras funcionalidades.

```jsx
import { useForm } from "react-hook-form";

const form = useForm({
  defaultValues: {
    type: "Todos",
    priority: "Todos",
    status: "Todos",
    date: "Todos",
    dateSelected: null,
  },
});
```

En caso de requerir validaciones, se recomienda el uso de Zod

```jsx
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const filterAlertSchema = z.object({
  name: z.string().min(1, { message: "Type cannot be empty." }),
  priority: z.string().noEmpty(),
  status: z.string().noEmpty(),
  date: z.string().noEmpty(),
  dateSelected: z.string().noEmpty(),
});

const form = useForm({
  defaultValues,
  resolver: zodResolver(filterAlertSchema),
});
```

[Ver Mala Práctica](bad-practices.md#formularios-mal-controlados)

---

## Control de Peticiones al Servidor

Las peticiones al servidor deben realizarse a través de una instancia de Axios.
Esto ofrece varias ventajas:

- Centraliza la gestión de solicitudes.
- Reduce la repetición de código en llamadas genéricas.
- Mejora el rendimiento al reutilizar una única instancia por ventana del navegador.

La instancia principal se asocia al objeto window del navegador.
Además, el token de autenticación se envía automáticamente mediante un interceptor de Axios.

```ts
// Instancia creada mediante la función createAxiosInstance en src/lib/axios.ts
// Posteriormente, se asigna al objeto window en src/lib/bootstrap.ts
window.axios = axios;
```

La forma recomendada de usar esta instancia es junto con el Hook useAxios, el cual recibe un callback que debe retornar una respuesta de Axios.

El Hook expone los siguientes valores:

- data
- loading
- error
- refetch

```jsx
import { useAxios } from "@/hooks/use-axios";

const { data, loading, error, refetch } = useAxios(() =>
  windows.axios.get("/endpoint")
);
```

También es posible especificar el tipo (Type) de la respuesta, lo que permite tipar adecuadamente el valor de **data**.

```tsx
import { useAxios } from "@/hooks/use-axios";

interface Example {
  title: string;
  description: string;
}

const { data, loading, error, refetch } = useAxios<Example[]>(() =>
  windows.axios.get("/endpoint")
);
```

---

## Control de Estados

Los estados deben gestionarse correctamente según el ciclo de vida de los componentes.
Es importante controlar las dependencias para evitar comportamientos inesperados, como:

Ejecución repetida de peticiones después del montaje del componente.

Para ello, es recomendable apoyarse en useEffect, useMemo y useCallback, asegurando que las actualizaciones ocurran únicamente cuando las dependencias cambien.

```jsx
const [items, setItems] = useState([]);
const [filters, setFilters] = useState({});

// Se ejecutara una unica vez
useEffect(() => {
  (async function () {
    const response = await axios.get("/endpoint");
  })();
}, []);

// Se ejecutara una únicamente cuando cambie el cliente
const filtered = useMemo(() => {
  return items;
}, [filters]);
```

## Optimización de Renders

No se cortara el ciclo de vida del componente haciendo un return prematuro en base a un valor, sino únicamente mediante su cambio de estados.

```jsx
const [loading, setLoading] = useState(false);

return (
  <>
    {loading} ? null : <h1>Cargado</h1>
  </>
);
```
