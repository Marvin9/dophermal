package shared

import "net"

func IsPortAvailable(port string) bool {
	ln, err := net.Listen("tcp", ":"+port)

	if err != nil {
		return false
	}

	defer ln.Close()
	return true
}
