from app.services.system_traceroute import parse_unix_hop_line, parse_windows_hop_line


def test_unix_successful_hop():
    hop = parse_unix_hop_line(" 1  192.168.1.1  1.00 ms  2.00 ms  3.00 ms")
    assert hop is not None
    assert hop["hop"] == 1
    assert hop["ip"] == "192.168.1.1"
    assert hop["latency_ms"] == 2.0
    assert hop["packet_loss_percent"] == 0.0


def test_unix_all_probes_timeout():
    hop = parse_unix_hop_line(" 2  * * *")
    assert hop is not None
    assert hop["status"] == "timeout"
    assert hop["packet_loss_percent"] == 100.0


def test_unix_partial_probe_loss():
    hop = parse_unix_hop_line(" 3  8.8.8.8  10.00 ms  *  12.00 ms")
    assert hop is not None
    assert hop["status"] == "success"
    assert hop["packet_loss_percent"] == 33.3
    assert hop["latency_ms"] == 11.0


def test_windows_timeout():
    hop = parse_windows_hop_line("  2     *        *        *     Request timed out.")
    assert hop is not None
    assert hop["status"] == "timeout"
    assert hop["packet_loss_percent"] == 100.0


def test_windows_successful_hop():
    hop = parse_windows_hop_line("  1     1 ms     2 ms     3 ms  192.168.1.1")
    assert hop is not None
    assert hop["ip"] == "192.168.1.1"
    assert hop["latency_ms"] == 2.0
