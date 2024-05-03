{
  description = "Blog Nix Flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      pkgs = import nixpkgs { inherit system; };
      system = "x86_64-linux";
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [ nodejs ];
      };
    };

}
