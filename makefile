test:
ifeq ($(OS), Windows_NT)
		@.\node_modules\.bin\mocha
else
		@./node_modules/.bin/mocha
endif
.PHONY: test