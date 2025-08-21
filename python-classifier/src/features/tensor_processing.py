"""Tensor Feature Processing"""

from typing import Dict

import torch


def extract_tensor_stats(tensor: torch.Tensor) -> Dict[str, float]:
    """Extracteer uitgebreide statistieken van tensor voor betere Gemini analyse"""
    # Basis stats
    stats = {
        "mean": float(tensor.mean()),
        "max": float(tensor.max()),
        "min": float(tensor.min()),
        "std": float(tensor.std()),
        "shape": str(tensor.shape),
    }
    
    # Uitgebreide analyse
    flat_tensor = tensor.flatten()
    
    # Spreiding analyse
    stats["range"] = float(stats["max"] - stats["min"])
    stats["variance"] = float(tensor.var())
    
    # Distributie kenmerken
    sorted_values = torch.sort(flat_tensor)[0]
    n = len(sorted_values)
    stats["median"] = float(sorted_values[n//2])
    stats["q25"] = float(sorted_values[n//4])
    stats["q75"] = float(sorted_values[3*n//4])
    
    # Afval-relevante patronen
    positive_ratio = float((tensor > 0).sum()) / tensor.numel()
    stats["positive_ratio"] = positive_ratio
    stats["negative_ratio"] = 1.0 - positive_ratio
    
    # Activatie intensiteit (belangrijk voor object detectie)
    high_activation_ratio = float((tensor > stats["mean"] + stats["std"]).sum()) / tensor.numel()
    stats["high_activation_ratio"] = high_activation_ratio
    
    return stats


def format_feature_description(stats: Dict[str, float]) -> str:
    """Format uitgebreide tensor statistieken voor Gemini analyse"""
    return f"""
CONVNEXT BASE MODEL ANALYSE RESULTAAT:
- Tensor vorm: {stats['shape']}
- Gemiddelde activatie: {stats['mean']:.3f}
- Activatie bereik: {stats['min']:.3f} tot {stats['max']:.3f} (spreiding: {stats['range']:.3f})
- Standaard deviatie: {stats['std']:.3f}
- Mediaan: {stats['median']:.3f}
- Kwartiel verdeling: Q25={stats['q25']:.3f}, Q75={stats['q75']:.3f}
- Positieve features: {stats['positive_ratio']:.1%}
- Hoge activatie patronen: {stats['high_activation_ratio']:.1%}

INTERPRETATIE HULP:
- Hoge spreiding + veel positieve features = complexe objecten (mogelijk afval)
- Lage spreiding + weinig hoge activatie = simpele achtergronden (mogelijk geen afval)
- Mediaan ver van gemiddelde = object met contrasten (mogelijk afval items)
"""
