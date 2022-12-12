import ivm from 'isolated-vm';

export async function createIsolate(userCodeStr: string) {
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  // Create a context inside this isolate to run the code in and inject variables/funcs
  const context = await isolate.createContext();

  // Get a Reference{} to the global object within the context.
  const jail = context.global;

  // set Promise to not do anthing in code because it has complex functionality inside the vm
  await jail.set('Promise', null);
}
