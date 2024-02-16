package state

type StateManagerInterface interface {
	Get(key string) (string, bool, error)
	Set(key, value string) error
	Remove(key string) error

	AddSet(key, value string) error
	HasInSet(key, value string) (bool, error)
	RemoveSet(key, value string) error
}
