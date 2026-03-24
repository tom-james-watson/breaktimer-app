{
  description = "Node.js dev environment with pnpm";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {

      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs
          pkgs.nodePackages.pnpm
        ];

        shellHook = ''
          echo "Node.js version: $(node -v)"
          echo "pnpm version: $(pnpm -v)"
        '';
      };

    };
}
