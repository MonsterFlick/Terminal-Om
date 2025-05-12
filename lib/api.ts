// Mock API functions for jokes and cat facts

// Get a random joke
export async function getRandomJoke(): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "Why did the developer go broke? Because he used up all his cache.",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
    "Why do Java developers wear glasses? Because they don't C#.",
    "What's a pirate's favorite programming language? R.",
    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    "Why did the functions stop calling each other? They had too many arguments.",
    "What's the object-oriented way to become wealthy? Inheritance.",
    "Why did the developer quit his job? He didn't get arrays.",
    "What do you call a programmer from Finland? Nerdic.",
    "Why don't programmers like nature? It has too many bugs.",
    "What's a computer's favorite snack? Microchips.",
    "Why was the computer cold? It left its Windows open.",
    "What's a programmer's favorite place to hang out? Foo Bar.",
    "Why did the programmer get stuck in the shower? The instructions said: Lather, Rinse, Repeat.",
    "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25!",
    "Why did the programmer go broke? He lost his domain in a poker game!",
    "What's a programmer's favorite hangout? The Foo Bar!",
    "Why don't programmers like to go outside? The sunlight causes too many reflections!",
    "What do you call a programmer who doesn't comment their code? A jerk!",
  ]

  return jokes[Math.floor(Math.random() * jokes.length)]
}

// Get a random cat fact
export async function getRandomCatFact(): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const catFacts = [
    "Cats make about 100 different sounds. Dogs make only about 10.",
    "A cat's brain is biologically more similar to a human brain than it is to a dog's.",
    "Cats have over 20 muscles that control their ears.",
    "A group of cats is called a 'clowder'.",
    "Cats spend about 70% of their lives sleeping.",
    "The first cat video was recorded in 1894 by Thomas Edison.",
    "Cats can jump up to six times their length.",
    "Cats have five toes on their front paws, but only four on their back paws.",
    "A cat can sprint at about 31 miles per hour.",
    "A cat's hearing is better than a dog's. And a cat can hear high-frequency sounds up to two octaves higher than a human.",
    "A cat can travel at a top speed of approximately 31 mph (49 km) over a short distance.",
    "A cat rubs against people to mark its territory with scent glands around its face.",
    "Cats have powerful night vision, allowing them to see at light levels six times lower than what a human needs in order to see.",
    "Cats have a third eyelid called a 'haw' that's normally not visible.",
    "A cat cannot see directly under its nose.",
    "Most cats don't have eyelashes.",
    "Cats have whiskers on the backs of their front legs, as well as on their heads.",
    "A cat's nose pad is ridged with a unique pattern, just like a human fingerprint.",
    "Cats can rotate their ears 180 degrees.",
    "The hearing of the average cat is at least five times keener than that of a human adult.",
  ]

  return catFacts[Math.floor(Math.random() * catFacts.length)]
}
