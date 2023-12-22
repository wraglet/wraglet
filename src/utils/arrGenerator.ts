const arrGenerator = (val: number): number[] =>
  Array.from({ length: val }, (_, i) => i + 1);

export default arrGenerator;
