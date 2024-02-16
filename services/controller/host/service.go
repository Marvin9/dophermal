package host

import (
	"strconv"
	"sync"

	"github.com/Marvin9/dophermal/services/controller/state"
	"go.uber.org/zap"
)

const (
	INITIAL_PORT        = "8000"
	NEXT_AVAILABLE_PORT = "NEXT_AVAILABLE_PORT"
	PORTS_IN_USE        = "PORTS_IN_USE"
)

type HostService struct {
	mutex        sync.Mutex
	stateManager state.StateManagerInterface
	logger       *zap.Logger
}

func NewHostService(sm state.StateManagerInterface, logger *zap.Logger) *HostService {
	return &HostService{
		stateManager: sm,
		logger:       logger,
		mutex:        sync.Mutex{},
	}
}

func (hs *HostService) AssignPort(id string) (string, error) {
	hs.mutex.Lock()
	defer hs.mutex.Unlock()

	nextAvailablePort, isNextAvailablePort, _ := hs.stateManager.Get(NEXT_AVAILABLE_PORT)

	if !isNextAvailablePort {
		hs.stateManager.Set(NEXT_AVAILABLE_PORT, INITIAL_PORT)
		nextAvailablePort = INITIAL_PORT
	}

	portToAssign := nextAvailablePort

	hs.stateManager.AddSet(PORTS_IN_USE, portToAssign)
	hs.stateManager.Set(id, portToAssign)

	// post assign process
	nextNewAvailablePort, err := hs.IncrementPort(nextAvailablePort)

	if err != nil {
		return "", err
	}

	hs.stateManager.Set(NEXT_AVAILABLE_PORT, nextNewAvailablePort)

	return portToAssign, nil
}

func (hs *HostService) ReleasePort(id string) error {
	hs.mutex.Lock()
	defer hs.mutex.Unlock()

	portUsed, _, _ := hs.stateManager.Get(id)
	hs.stateManager.RemoveSet(PORTS_IN_USE, portUsed)
	hs.stateManager.Remove(id)

	return nil

	// TODO: do better to avoid PORT "holes"
}

func (hs *HostService) IncrementPort(port string) (string, error) {
	portInt, err := strconv.Atoi(port)

	if err != nil {
		return "", err
	}

	portInt++

	if portInt > 9999 {
		hs.logger.Error("port limit reached", zap.Int("next-port", portInt))
	}

	return strconv.Itoa(portInt), nil
}
