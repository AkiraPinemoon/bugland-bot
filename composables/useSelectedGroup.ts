export default function () {
  return useGroups().value?.groups.find(
    (group) => group.id == useSelectedGroupId().value
  );
}
