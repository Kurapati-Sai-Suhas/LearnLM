# groups/hybrid_router.py
import math
import networkx as nx

# ─────────────────────────────────────────────────────────────
# PREREQUISITE GRAPHS — one per subject
# ─────────────────────────────────────────────────────────────

DSA_GRAPH = nx.DiGraph()
DSA_GRAPH.add_edges_from([
    ("Variables",     "Arrays"),
    ("Arrays",        "Strings"),
    ("Arrays",        "LinkedList"),
    ("LinkedList",    "Stack"),
    ("LinkedList",    "Queue"),
    ("Stack",         "Trees"),
    ("Queue",         "Trees"),
    ("Trees",         "BST"),
    ("BST",           "Heaps"),
    ("Trees",         "Graphs"),
    ("Graphs",        "DFS"),
    ("Graphs",        "BFS"),
    ("DFS",           "Backtracking"),
    ("BFS",           "ShortestPath"),
    ("Arrays",        "Sorting"),
    ("Sorting",       "BinarySearch"),
    ("BinarySearch",  "DynamicProgramming"),
    ("Backtracking",  "DynamicProgramming"),
])

OS_GRAPH = nx.DiGraph()
OS_GRAPH.add_edges_from([
    ("ProcessBasics",    "Threads"),
    ("ProcessBasics",    "Scheduling"),
    ("Threads",          "Synchronization"),
    ("Synchronization",  "Deadlocks"),
    ("Scheduling",       "MemoryManagement"),
    ("MemoryManagement", "VirtualMemory"),
    ("VirtualMemory",    "Paging"),
    ("Paging",           "Segmentation"),
])

CN_GRAPH = nx.DiGraph()
CN_GRAPH.add_edges_from([
    ("OSIModel",      "PhysicalLayer"),
    ("OSIModel",      "DataLinkLayer"),
    ("DataLinkLayer", "NetworkLayer"),
    ("NetworkLayer",  "IP"),
    ("IP",            "TCP"),
    ("IP",            "UDP"),
    ("TCP",           "HTTP"),
    ("HTTP",          "DNS"),
    ("HTTP",          "TLS"),
])

# Map subject keywords → graph
SUBJECT_GRAPHS = {
    "data structures": DSA_GRAPH,
    "algorithms":      DSA_GRAPH,
    "dsa":             DSA_GRAPH,
    "operating systems": OS_GRAPH,
    "os":              OS_GRAPH,
    "computer networks": CN_GRAPH,
    "networks":        CN_GRAPH,
}

HIERARCHICAL_SUBJECTS = set(SUBJECT_GRAPHS.keys()) | {
    "database", "compiler design", "mathematics", "discrete math"
}


class HierarchicalEngine:

    @staticmethod
    def _get_graph(subject: str) -> nx.DiGraph:
        s = subject.lower().strip()
        for key, graph in SUBJECT_GRAPHS.items():
            if key in s:
                return graph
        return DSA_GRAPH  # default fallback

    @classmethod
    def get_next_topic(cls, subject: str, mastered_topics: list) -> dict:
        graph    = cls._get_graph(subject)
        mastered = set(mastered_topics)
        candidates = []

        for node in graph.nodes:
            if node in mastered:
                continue
            prerequisites = set(graph.predecessors(node))
            if prerequisites.issubset(mastered):
                candidates.append(node)

        total_nodes = len(graph.nodes)

        if not candidates:
            roots = [n for n in graph.nodes if graph.in_degree(n) == 0]
            unmastered_roots = [r for r in roots if r not in mastered]
            if unmastered_roots:
                first = unmastered_roots[0]
                return {
                    "recommended_topic":    first,
                    "reason":               "Start here — this is the foundation topic.",
                    "prerequisites_needed": [],
                    "unlocks":              list(graph.successors(first)),
                    "mastery_percentage":   round(len(mastered) / total_nodes * 100, 1),
                }
            return {
                "recommended_topic":    None,
                "reason":               "You have mastered all topics! 🎉",
                "prerequisites_needed": [],
                "unlocks":              [],
                "mastery_percentage":   100.0,
            }

        best = max(candidates, key=lambda t: len(list(graph.successors(t))))
        return {
            "recommended_topic":    best,
            "reason":               f"All prerequisites satisfied. Mastering this unlocks {len(list(graph.successors(best)))} new topic(s).",
            "prerequisites_needed": list(graph.predecessors(best)),
            "unlocks":              list(graph.successors(best)),
            "mastery_percentage":   round(len(mastered) / total_nodes * 100, 1),
        }

    @classmethod
    def get_mastery_map(cls, subject: str, mastered_topics: list) -> dict:
        graph    = cls._get_graph(subject)
        mastered = set(mastered_topics)
        result   = {}
        for node in graph.nodes:
            prereqs  = list(graph.predecessors(node))
            unlocked = all(p in mastered for p in prereqs) if prereqs else True
            result[node] = {
                "mastered":      node in mastered,
                "unlocked":      unlocked,
                "prerequisites": prereqs,
                "unlocks":       list(graph.successors(node)),
            }
        return result


# ─────────────────────────────────────────────────────────────
# ELO ENGINE
# ─────────────────────────────────────────────────────────────

class EloEngine:
    K = 32

    @staticmethod
    def expected_score(player_rating: float, question_difficulty: float) -> float:
        return 1 / (1 + math.pow(10, (question_difficulty - player_rating) / 400))

    @classmethod
    def update_rating(cls, player_rating: float, question_difficulty: float, got_correct: bool) -> dict:
        expected   = cls.expected_score(player_rating, question_difficulty)
        actual     = 1.0 if got_correct else 0.0
        delta      = cls.K * (actual - expected)
        new_rating = round(player_rating + delta, 2)

        if delta > 20:    msg = "Excellent! Well above expectations. 🔥"
        elif delta > 5:   msg = "Good job! Improving. ✅"
        elif delta > -5:  msg = "Expected performance. Keep going. 📈"
        elif delta > -20: msg = "Tougher than expected. Review this topic. 📚"
        else:             msg = "Needs work. Revisit the basics. 💪"

        return {
            "old_rating":           player_rating,
            "new_rating":           new_rating,
            "delta":                round(delta, 2),
            "expected_probability": round(expected, 3),
            "result":               "correct" if got_correct else "incorrect",
            "performance_message":  msg,
        }

    @classmethod
    def pick_next_difficulty(cls, player_rating: float) -> dict:
        target = player_rating + 50
        if target < 1000:   band = "beginner"
        elif target < 1200: band = "easy"
        elif target < 1400: band = "medium"
        elif target < 1600: band = "hard"
        else:               band = "expert"
        return {
            "target_difficulty": round(target),
            "difficulty_band":   band,
            "player_rating":     player_rating,
            "tip":               f"Next question should be rated ~{round(target)} ({band}).",
        }


# ─────────────────────────────────────────────────────────────
# THE TRAFFIC COP
# ─────────────────────────────────────────────────────────────

def route_recommendation(subject: str, user_data: dict) -> dict:
    subject_lower   = subject.lower().strip()
    is_hierarchical = any(s in subject_lower for s in HIERARCHICAL_SUBJECTS)

    if is_hierarchical:
        mastered = user_data.get("mastered_topics", [])
        return {
            "engine_used":    "hierarchical_prerequisite_graph",
            "subject":        subject,
            "recommendation": HierarchicalEngine.get_next_topic(subject, mastered),
        }
    else:
        elo        = float(user_data.get("elo_rating", 1200.0))
        difficulty = user_data.get("question_difficulty")
        correct    = user_data.get("got_correct")

        if difficulty is not None and correct is not None:
            update = EloEngine.update_rating(elo, float(difficulty), bool(correct))
            return {
                "engine_used":   "elo_rating",
                "subject":       subject,
                "rating_update": update,
                "next_question": EloEngine.pick_next_difficulty(update["new_rating"]),
            }
        return {
            "engine_used":   "elo_rating",
            "subject":       subject,
            "next_question": EloEngine.pick_next_difficulty(elo),
        }