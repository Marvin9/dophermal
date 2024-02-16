package state

type inMemoryState struct {
	set map[string]map[string]bool
	kv  map[string]string
}

func NewInMemoryState() StateManagerInterface {
	return &inMemoryState{
		set: map[string]map[string]bool{},
		kv:  map[string]string{},
	}
}

func (sm *inMemoryState) AddSet(key, value string) error {
	_, ok := sm.set[key]

	if !ok {
		sm.set[key] = map[string]bool{}
	}

	sm.set[key][value] = true

	return nil
}

func (sm *inMemoryState) HasInSet(key, value string) (bool, error) {
	keySet, ok := sm.set[key]

	if !ok {
		return false, nil
	}

	_, ok = keySet[value]

	return ok, nil
}

func (sm *inMemoryState) RemoveSet(key, value string) error {
	ok, _ := sm.HasInSet(key, value)

	if !ok {
		return nil
	}

	nestedMap := sm.set[key]

	delete(nestedMap, value)

	sm.set[key] = nestedMap

	return nil
}

func (sm *inMemoryState) Get(key string) (string, bool, error) {
	value, ok := sm.kv[key]

	if ok {
		return value, true, nil
	}

	return "", false, nil
}

func (sm *inMemoryState) Set(key, value string) error {
	sm.kv[key] = value
	return nil
}

func (sm *inMemoryState) Remove(key string) error {
	delete(sm.kv, key)
	return nil
}
