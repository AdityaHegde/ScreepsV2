export function getInstanceFromClassObject(ClassObject, value) {
  if (ClassObject.getInstanceById) {
    return ClassObject.getInstanceById(value);
  } else {
    return new ClassObject(value);
  }
}
