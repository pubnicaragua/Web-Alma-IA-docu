# Errores Generales

## Formularios mal controlados

Los formularios manejan sus campos mediantes estados separados por cada campo en lugar de usar un estado global.

```jsx
// app/alerts/pages.tsx

const [typeFilter, setTypeFilter] = useState<string>("Todos");
const [priorityFilter, setPriorityFilter] = useState<string>("Todos");
const [statusFilter, setStatusFilter] = useState<string>("Todos");
const [dateFilter, setDateFilter] = useState<string>("Todos");
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
```


## Patrón Hexagonal incompleto

Se intento a medias implementar un patrón hexagonal. Muchas funcionalidades siguieron quedando a medias en los componentes

```jsx
// services/alerts-service.ts



```

## Mal uso de librerías

Axios no utilizado

```jsx
// services/alerts-service.ts



```
